import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guards";
import { convertQuoteToOrder } from "@/features/orders/server/sales-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await convertQuoteToOrder({
      quoteId: id,
      adminUserId: session.user.id,
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible convertir la cotizacion.",
      },
      { status: 400 },
    );
  }
}
