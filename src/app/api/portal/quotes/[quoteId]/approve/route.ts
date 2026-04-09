import { NextResponse } from "next/server";
import { requireCustomerSession } from "@/lib/auth/guards";
import { approveQuoteFromPortal } from "@/features/orders/server/sales-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  const session = await requireCustomerSession();

  if (!session?.user.customerId) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const { quoteId } = await params;

  try {
    const order = await approveQuoteFromPortal({
      quoteId,
      customerId: session.user.customerId,
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible aprobar la cotizacion.",
      },
      { status: 400 },
    );
  }
}
