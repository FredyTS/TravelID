import {
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentScheduleStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe/client";

function getAdminOrderUrl(orderId: string) {
  return `${env.appUrl}/admin/orders/${orderId}`;
}

async function recalculateOrderPaymentState(orderId: string) {
  const [order, payments, schedules] = await Promise.all([
    prisma.order.findUniqueOrThrow({
      where: { id: orderId },
    }),
    prisma.payment.findMany({
      where: {
        orderId,
        status: {
          in: [PaymentStatus.SUCCEEDED, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED],
        },
      },
    }),
    prisma.paymentSchedule.findMany({
      where: { orderId },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const paidTotal = payments.reduce((acc, payment) => {
    const amount = Number(payment.amount);

    if (payment.status === PaymentStatus.REFUNDED) {
      return acc;
    }

    return acc + amount;
  }, 0);

  const grandTotal = Number(order.grandTotal);
  const balanceDue = Math.max(grandTotal - paidTotal, 0);

  let nextStatus: OrderStatus = OrderStatus.AWAITING_DEPOSIT;

  if (paidTotal <= 0) {
    nextStatus = OrderStatus.AWAITING_DEPOSIT;
  } else if (balanceDue > 0) {
    nextStatus = OrderStatus.PARTIALLY_PAID;
  } else {
    nextStatus = OrderStatus.PAID;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      paidTotal,
      balanceDue,
      status: nextStatus,
    },
  });

  for (const schedule of schedules) {
    const schedulePayments = await prisma.payment.findMany({
      where: {
        paymentScheduleId: schedule.id,
        status: {
          in: [PaymentStatus.SUCCEEDED, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED],
        },
      },
    });

    const scheduledPaid = schedulePayments.reduce((acc, payment) => {
      if (payment.status === PaymentStatus.REFUNDED) {
        return acc;
      }

      return acc + Number(payment.amount);
    }, 0);

    const scheduleAmount = Number(schedule.amount);
    const nextScheduleStatus =
      scheduledPaid >= scheduleAmount ? PaymentScheduleStatus.PAID : PaymentScheduleStatus.PENDING;

    if (schedule.status !== nextScheduleStatus) {
      await prisma.paymentSchedule.update({
        where: { id: schedule.id },
        data: { status: nextScheduleStatus },
      });
    }
  }
}

export async function createOrderCheckoutSession(input: {
  orderId: string;
  scheduleId?: string;
}) {
  if (!stripe) {
    throw new Error("Stripe no esta configurado.");
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      customer: true,
      paymentSchedules: {
        where: { status: PaymentScheduleStatus.PENDING },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  if (!order) {
    throw new Error("Pedido no encontrado.");
  }

  const schedule =
    order.paymentSchedules.find((item) => item.id === input.scheduleId) ?? order.paymentSchedules[0];

  if (!schedule) {
    throw new Error("No hay pagos pendientes para este pedido.");
  }

  const amount = Number(schedule.amount);
  const customerName = [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.customer.email ?? undefined,
    success_url: `${getAdminOrderUrl(order.id)}?payment=success`,
    cancel_url: `${getAdminOrderUrl(order.id)}?payment=cancelled`,
    metadata: {
      orderId: order.id,
      paymentScheduleId: schedule.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `${order.title} - ${schedule.dueType}`,
            description: customerName || order.orderNumber,
          },
        },
      },
    ],
  });

  await prisma.payment.upsert({
    where: {
      providerCheckoutSessionId: session.id,
    },
    update: {
      amount,
      currency: order.currency,
      orderId: order.id,
      paymentScheduleId: schedule.id,
      quoteId: order.quoteId,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CARD,
      rawResponse: session as unknown as Prisma.JsonObject,
    },
    create: {
      orderId: order.id,
      paymentScheduleId: schedule.id,
      quoteId: order.quoteId,
      provider: PaymentProvider.STRIPE,
      providerCheckoutSessionId: session.id,
      providerPaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      amount,
      currency: order.currency,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CARD,
      rawResponse: session as unknown as Prisma.JsonObject,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Payment",
      entityId: session.id,
      action: "CHECKOUT_CREATED",
      description: `Checkout creado para ${order.orderNumber}.`,
      actorType: "USER",
      metadata: {
        orderId: order.id,
        paymentScheduleId: schedule.id,
        checkoutSessionId: session.id,
      },
    },
  });

  return session;
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const paymentScheduleId = session.metadata?.paymentScheduleId;

  if (!orderId || !paymentScheduleId) {
    throw new Error("El checkout no contiene metadatos suficientes.");
  }

  const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

  await prisma.payment.upsert({
    where: {
      providerCheckoutSessionId: session.id,
    },
    update: {
      providerPaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      status: PaymentStatus.SUCCEEDED,
      method: PaymentMethod.CARD,
      paidAt: new Date(),
      amount: amountTotal,
      rawResponse: session as unknown as Prisma.JsonObject,
    },
    create: {
      orderId,
      paymentScheduleId,
      provider: PaymentProvider.STRIPE,
      providerCheckoutSessionId: session.id,
      providerPaymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : undefined,
      amount: amountTotal,
      currency: (session.currency ?? "mxn").toUpperCase(),
      status: PaymentStatus.SUCCEEDED,
      method: PaymentMethod.CARD,
      paidAt: new Date(),
      rawResponse: session as unknown as Prisma.JsonObject,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Order",
      entityId: orderId,
      action: "PAYMENT_SUCCEEDED",
      description: `Pago Stripe confirmado para el pedido ${orderId}.`,
      actorType: "SYSTEM",
      metadata: {
        checkoutSessionId: session.id,
        paymentScheduleId,
      },
    },
  });

  await recalculateOrderPaymentState(orderId);
}
