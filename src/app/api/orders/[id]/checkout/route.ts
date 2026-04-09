import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, requireCustomerSession } from "@/lib/auth/guards";
import { canAccessCustomerResource } from "@/lib/permissions/policies";
import { prisma } from "@/lib/db/prisma";
import { createPaymentPreference } from "@/features/payments/server/payment-service";

const payloadSchema = z.object({
  scheduleId: z.string().optional(),
  audience: z.enum(["admin", "client"]).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const payload = payloadSchema.parse(json);
  const adminSession = await requireAdminSession();
  const customerSession = await requireCustomerSession();

  if (!adminSession && !customerSession) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  if (customerSession?.user.customerId) {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { customerId: true },
    });

    if (!order || !canAccessCustomerResource(customerSession.user.customerId, order.customerId)) {
      return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 403 });
    }
  }

  try {
    const checkout = await createPaymentPreference({
      orderId: id,
      scheduleId: payload.scheduleId,
      audience: adminSession ? "admin" : "client",
    });

    return NextResponse.json({
      ok: true,
      url: checkout.url,
      checkoutSessionId: checkout.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible crear el link de pago.",
      },
      { status: 400 },
    );
  }
}
