import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guards";
import { sendAdminMessage } from "@/features/communications/server/communications-service";

const payloadSchema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(2).max(2000),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session?.user.id) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const payload = payloadSchema.parse(json);

  try {
    const message = await sendAdminMessage({
      threadId: payload.threadId,
      adminUserId: session.user.id,
      body: payload.body,
    });

    return NextResponse.json({ ok: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible enviar la respuesta.",
      },
      { status: 400 },
    );
  }
}
