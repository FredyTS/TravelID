import { NextResponse } from "next/server";
import { z } from "zod";
import { createDirectReservation } from "@/features/orders/server/sales-service";

const reservationSchema = z.object({
  packageSlug: z.string().min(1),
  firstName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  originCity: z.string().optional(),
  departureDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const data = reservationSchema.parse(json);

  try {
    const order = await createDirectReservation(data);

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      message: `Reserva recibida. Tu pedido ${order.orderNumber} quedo creado y pendiente de anticipo.`,
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
