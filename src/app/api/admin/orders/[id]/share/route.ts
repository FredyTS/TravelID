import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guards";
import { getOrderShareUrl, sendOrderShareLink } from "@/features/sharing/server/tracking-links";

const payloadSchema = z.object({
  recipientEmail: z.string().email().optional(),
  action: z.enum(["preview", "send"]).default("preview"),
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
    if (payload.action === "preview") {
      const shareUrl = await getOrderShareUrl(id);
      return NextResponse.json({ ok: true, shareUrl });
    }

    if (!payload.recipientEmail) {
      return NextResponse.json({ ok: false, message: "Debes indicar el correo destinatario." }, { status: 400 });
    }

    const result = await sendOrderShareLink({
      orderId: id,
      recipientEmail: payload.recipientEmail,
      actorUserId: session.user.id,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "No fue posible compartir el pedido.",
      },
      { status: 400 },
    );
  }
}
