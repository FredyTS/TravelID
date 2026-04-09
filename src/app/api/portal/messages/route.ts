import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomerSession } from "@/lib/auth/guards";
import { sendCustomerMessage } from "@/features/communications/server/communications-service";

const payloadSchema = z.object({
  threadId: z.string().optional(),
  orderId: z.string().optional(),
  quoteId: z.string().optional(),
  subject: z.string().min(3).max(120).optional(),
  body: z.string().min(2).max(2000),
});

export async function POST(request: Request) {
  const session = await requireCustomerSession();

  if (!session?.user.customerId) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const payload = payloadSchema.parse(json);

  try {
    const message = await sendCustomerMessage({
      customerId: session.user.customerId,
      threadId: payload.threadId,
      orderId: payload.orderId,
      quoteId: payload.quoteId,
      subject: payload.subject,
      body: payload.body,
    });

    return NextResponse.json({ ok: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible enviar el mensaje.",
      },
      { status: 400 },
    );
  }
}
