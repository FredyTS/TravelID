import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { handleMercadoPagoWebhook } from "@/features/payments/server/payment-service";

function resolveEventId(payload: Record<string, unknown>) {
  const type = typeof payload.type === "string" ? payload.type : "payment";
  const notificationId =
    typeof payload.id === "string" || typeof payload.id === "number"
      ? String(payload.id)
      : (payload.data as { id?: string | number } | undefined)?.id
        ? String((payload.data as { id?: string | number }).id)
        : `${type}-${Date.now()}`;

  return `${type}:${notificationId}`;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const eventType =
    typeof payload.type === "string"
      ? payload.type
      : typeof payload.action === "string"
        ? payload.action
        : "payment";

  const eventId = resolveEventId(payload);

  const existing = await prisma.mercadoPagoEventLog.findUnique({
    where: { eventId },
  });

  if (existing) {
    return NextResponse.json({ ok: true, deduplicated: true });
  }

  await prisma.mercadoPagoEventLog.create({
    data: {
      eventId,
      eventType,
      payload: payload as Prisma.JsonObject,
    },
  });

  if (eventType.includes("payment") || (payload.data as { id?: unknown } | undefined)?.id) {
    await handleMercadoPagoWebhook(payload);
  }

  return NextResponse.json({ ok: true, received: eventType });
}
