import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomerSession } from "@/lib/auth/guards";
import {
  rejectQuoteFromPortal,
  requestQuoteChangesFromPortal,
} from "@/features/orders/server/sales-service";

const payloadSchema = z.object({
  action: z.enum(["REQUEST_CHANGES", "REJECT"]),
  body: z.string().max(2000).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quoteId: string }> },
) {
  const session = await requireCustomerSession();

  if (!session?.user.customerId) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const { quoteId } = await params;
  const json = await request.json().catch(() => ({}));
  const payload = payloadSchema.parse(json);

  try {
    const result =
      payload.action === "REQUEST_CHANGES"
        ? await requestQuoteChangesFromPortal({
            quoteId,
            customerId: session.user.customerId,
            body: payload.body?.trim() || "Quiero ajustar esta propuesta antes de confirmarla.",
          })
        : await rejectQuoteFromPortal({
            quoteId,
            customerId: session.user.customerId,
            body: payload.body?.trim(),
          });

    return NextResponse.json({ ok: true, quoteId: result.id, status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible procesar tu respuesta.",
      },
      { status: 400 },
    );
  }
}
