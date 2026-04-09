import {
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentScheduleStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

function getAppOrderUrl(orderId: string, audience: "admin" | "client") {
  return audience === "admin"
    ? `${env.appUrl}/admin/orders/${orderId}`
    : `${env.appUrl}/portal/viajes/${orderId}`;
}

function getMercadoPagoHeaders() {
  if (!env.mercadoPagoAccessToken) {
    throw new Error("Mercado Pago no esta configurado.");
  }

  return {
    Authorization: `Bearer ${env.mercadoPagoAccessToken}`,
    "Content-Type": "application/json",
  };
}

function mapMercadoPagoStatus(status?: string | null) {
  switch (status) {
    case "approved":
      return PaymentStatus.SUCCEEDED;
    case "in_process":
    case "pending":
      return PaymentStatus.PROCESSING;
    case "refunded":
      return PaymentStatus.REFUNDED;
    case "cancelled":
      return PaymentStatus.CANCELLED;
    case "rejected":
      return PaymentStatus.FAILED;
    default:
      return PaymentStatus.PENDING;
  }
}

function mapMercadoPagoMethod(paymentTypeId?: string | null) {
  switch (paymentTypeId) {
    case "bank_transfer":
      return PaymentMethod.SPEI;
    case "ticket":
      return PaymentMethod.CASH;
    case "credit_card":
    case "debit_card":
      return PaymentMethod.CARD;
    default:
      return PaymentMethod.OTHER;
  }
}

export async function recalculateOrderPaymentState(orderId: string) {
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
    if (payment.status === PaymentStatus.REFUNDED) {
      return acc;
    }

    return acc + Number(payment.amount);
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
    const schedulePayments = payments.filter((payment) => payment.paymentScheduleId === schedule.id);
    const scheduledPaid = schedulePayments.reduce((acc, payment) => {
      if (payment.status === PaymentStatus.REFUNDED) {
        return acc;
      }

      return acc + Number(payment.amount);
    }, 0);

    const nextScheduleStatus =
      scheduledPaid >= Number(schedule.amount) ? PaymentScheduleStatus.PAID : PaymentScheduleStatus.PENDING;

    if (schedule.status !== nextScheduleStatus) {
      await prisma.paymentSchedule.update({
        where: { id: schedule.id },
        data: { status: nextScheduleStatus },
      });
    }
  }
}

export async function createPaymentPreference(input: {
  orderId: string;
  scheduleId?: string;
  audience?: "admin" | "client";
}) {
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
    throw new Error("No hay cobros pendientes para este pedido.");
  }

  const audience = input.audience ?? "client";
  const baseUrl = getAppOrderUrl(order.id, audience);
  const amount = Number(schedule.amount);
  const fullName = [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ");

  const payload = {
    items: [
      {
        id: schedule.id,
        title: `${order.title} - ${schedule.dueType}`,
        description: `${order.orderNumber} | ${schedule.dueType}`,
        quantity: 1,
        currency_id: order.currency,
        unit_price: amount,
      },
    ],
    payer: {
      name: order.customer.firstName ?? "Cliente",
      surname: order.customer.lastName ?? "",
      email: order.customer.email ?? undefined,
    },
    external_reference: `${order.id}:${schedule.id}`,
    back_urls: {
      success: `${baseUrl}?payment=success`,
      failure: `${baseUrl}?payment=failure`,
      pending: `${baseUrl}?payment=pending`,
    },
    notification_url: `${env.appUrl}/api/payments/mercadopago/webhook`,
    auto_return: "approved",
    metadata: {
      orderId: order.id,
      paymentScheduleId: schedule.id,
      orderNumber: order.orderNumber,
      customerName: fullName,
    },
  };

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: getMercadoPagoHeaders(),
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as {
    id?: string;
    init_point?: string;
    sandbox_init_point?: string;
    [key: string]: unknown;
  };

  if (!response.ok || !result.id || !(result.init_point || result.sandbox_init_point)) {
    throw new Error("No fue posible crear la preferencia de pago en Mercado Pago.");
  }

  await prisma.payment.upsert({
    where: {
      providerCheckoutSessionId: result.id,
    },
    update: {
      amount,
      currency: order.currency,
      orderId: order.id,
      paymentScheduleId: schedule.id,
      quoteId: order.quoteId,
      provider: PaymentProvider.MERCADO_PAGO,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.OTHER,
      rawResponse: result as Prisma.JsonObject,
    },
    create: {
      orderId: order.id,
      paymentScheduleId: schedule.id,
      quoteId: order.quoteId,
      provider: PaymentProvider.MERCADO_PAGO,
      providerCheckoutSessionId: result.id,
      amount,
      currency: order.currency,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.OTHER,
      rawResponse: result as Prisma.JsonObject,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Payment",
      entityId: result.id,
      action: "PAYMENT_LINK_CREATED",
      description: `Link de cobro creado en Mercado Pago para ${order.orderNumber}.`,
      actorType: "SYSTEM",
      metadata: {
        orderId: order.id,
        paymentScheduleId: schedule.id,
        audience,
      },
    },
  });

  return {
    id: result.id,
    url: result.init_point ?? result.sandbox_init_point ?? "",
  };
}

async function fetchMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: getMercadoPagoHeaders(),
  });

  if (!response.ok) {
    throw new Error("No fue posible consultar el pago en Mercado Pago.");
  }

  return (await response.json()) as {
    id: number | string;
    status?: string;
    payment_type_id?: string;
    date_approved?: string;
    transaction_amount?: number;
    currency_id?: string;
    external_reference?: string;
    order?: { id?: string | null };
    metadata?: {
      orderId?: string;
      paymentScheduleId?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export async function handleMercadoPagoWebhook(payload: Record<string, unknown>) {
  const paymentId =
    (payload.data as { id?: string | number } | undefined)?.id ??
    (typeof payload.resource === "string" ? payload.resource.split("/").pop() : undefined);

  if (!paymentId) {
    return { ignored: true };
  }

  const paymentDetails = await fetchMercadoPagoPayment(String(paymentId));
  const externalReference = paymentDetails.external_reference ?? "";
  const [orderId, paymentScheduleId] = externalReference.split(":");
  const resolvedOrderId = paymentDetails.metadata?.orderId ?? orderId;
  const resolvedScheduleId = paymentDetails.metadata?.paymentScheduleId ?? paymentScheduleId;

  if (!resolvedOrderId) {
    throw new Error("El pago de Mercado Pago no contiene orderId.");
  }

  const status = mapMercadoPagoStatus(paymentDetails.status);

  await prisma.payment.upsert({
    where: {
      providerPaymentIntentId: String(paymentDetails.id),
    },
    update: {
      orderId: resolvedOrderId,
      paymentScheduleId: resolvedScheduleId || undefined,
      provider: PaymentProvider.MERCADO_PAGO,
      status,
      method: mapMercadoPagoMethod(paymentDetails.payment_type_id),
      amount: paymentDetails.transaction_amount ?? 0,
      currency: paymentDetails.currency_id ?? "MXN",
      paidAt: paymentDetails.date_approved ? new Date(paymentDetails.date_approved) : undefined,
      rawResponse: paymentDetails as Prisma.JsonObject,
    },
    create: {
      orderId: resolvedOrderId,
      paymentScheduleId: resolvedScheduleId || undefined,
      provider: PaymentProvider.MERCADO_PAGO,
      providerPaymentIntentId: String(paymentDetails.id),
      amount: paymentDetails.transaction_amount ?? 0,
      currency: paymentDetails.currency_id ?? "MXN",
      status,
      method: mapMercadoPagoMethod(paymentDetails.payment_type_id),
      paidAt: paymentDetails.date_approved ? new Date(paymentDetails.date_approved) : undefined,
      rawResponse: paymentDetails as Prisma.JsonObject,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Order",
      entityId: resolvedOrderId,
      action: "PAYMENT_STATUS_UPDATED",
      description: `Mercado Pago actualizo el cobro a ${paymentDetails.status ?? "pending"}.`,
      actorType: "SYSTEM",
      metadata: {
        paymentId: String(paymentDetails.id),
        paymentScheduleId: resolvedScheduleId,
      },
    },
  });

  await recalculateOrderPaymentState(resolvedOrderId);

  return {
    ok: true,
    orderId: resolvedOrderId,
    paymentId: String(paymentDetails.id),
  };
}
