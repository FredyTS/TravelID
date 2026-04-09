import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guards";
import { createOrderCheckoutSession } from "@/features/payments/server/payment-service";

const payloadSchema = z.object({
  scheduleId: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const payload = payloadSchema.parse(json);

  try {
    const checkout = await createOrderCheckoutSession({
      orderId: id,
      scheduleId: payload.scheduleId,
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
        message: error instanceof Error ? error.message : "No fue posible crear el checkout.",
      },
      { status: 400 },
    );
  }
}
