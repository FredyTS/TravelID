import { NextResponse } from "next/server";
import { z } from "zod";
import { createDirectReservation } from "@/features/orders/server/sales-service";
import { sendOrderShareLink } from "@/features/sharing/server/tracking-links";

const reservationSchema = z.object({
  packageSlug: z.string().min(1),
  firstName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  departureDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const data = reservationSchema.parse(json);

  try {
    const order = await createDirectReservation(data);

    await sendOrderShareLink({
      orderId: order.id,
      recipientEmail: data.email,
      actorUserId: order.assignedAgentId ?? undefined,
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      message: `Reserva inmediata recibida. Te enviamos un link por correo para consultar tu pedido ${order.orderNumber}, revisar el anticipo y dar seguimiento a tu viaje.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible crear la reserva.",
      },
      { status: 400 },
    );
  }
}
