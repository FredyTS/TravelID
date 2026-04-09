import { NextResponse } from "next/server";
import { EmailDeliveryStatus, EmailProvider } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

type MailchimpWebhookMessage = {
  _id?: string;
  email?: string;
  subject?: string;
  metadata?: Record<string, unknown>;
};

type MailchimpWebhookEvent = {
  event?: string;
  ts?: number;
  msg?: MailchimpWebhookMessage;
};

function mapWebhookStatus(eventType?: string) {
  switch (eventType) {
    case "send":
      return EmailDeliveryStatus.SENT;
    case "deferral":
      return EmailDeliveryStatus.QUEUED;
    case "hard_bounce":
    case "soft_bounce":
      return EmailDeliveryStatus.BOUNCED;
    case "open":
      return EmailDeliveryStatus.OPENED;
    case "click":
      return EmailDeliveryStatus.CLICKED;
    case "spam":
    case "unsub":
      return EmailDeliveryStatus.COMPLAINED;
    case "reject":
      return EmailDeliveryStatus.REJECTED;
    default:
      return null;
  }
}

export async function POST(request: Request) {
  if (env.mailchimpTransactionalWebhookKey) {
    const incomingKey =
      request.headers.get("x-webhook-key") ??
      new URL(request.url).searchParams.get("key") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (incomingKey !== env.mailchimpTransactionalWebhookKey) {
      return NextResponse.json({ ok: false, message: "Unauthorized webhook." }, { status: 401 });
    }
  }

  const formData = await request.formData();
  const rawEvents = formData.get("mandrill_events");

  if (typeof rawEvents !== "string") {
    return NextResponse.json({ ok: false, message: "Payload mandrill_events no encontrado." }, { status: 400 });
  }

  let events: MailchimpWebhookEvent[] = [];

  try {
    events = JSON.parse(rawEvents) as MailchimpWebhookEvent[];
  } catch {
    return NextResponse.json({ ok: false, message: "No fue posible parsear el webhook." }, { status: 400 });
  }

  for (const event of events) {
    const providerMessageId = event.msg?._id ?? null;
    const metadata = event.msg?.metadata ?? {};
    const metadataEmailLogId =
      typeof metadata.emailLogId === "string" && metadata.emailLogId.trim() ? metadata.emailLogId : null;

    const emailLog =
      (metadataEmailLogId
        ? await prisma.emailDeliveryLog.findUnique({ where: { id: metadataEmailLogId } })
        : null) ??
      (providerMessageId
        ? await prisma.emailDeliveryLog.findUnique({ where: { providerMessageId } })
        : null);

    await prisma.emailWebhookEventLog.create({
      data: {
        provider: EmailProvider.MAILCHIMP_TRANSACTIONAL,
        eventType: event.event ?? "unknown",
        providerEventId: null,
        providerMessageId: providerMessageId ?? undefined,
        emailLogId: emailLog?.id,
        payload: JSON.parse(JSON.stringify(event)),
      },
    });

    if (!emailLog) {
      continue;
    }

    const status = mapWebhookStatus(event.event);
    const eventDate = event.ts ? new Date(event.ts * 1000) : new Date();

    await prisma.emailDeliveryLog.update({
      where: { id: emailLog.id },
      data: {
        provider: EmailProvider.MAILCHIMP_TRANSACTIONAL,
        status: status ?? emailLog.status,
        providerEventType: event.event ?? undefined,
        providerPayload: JSON.parse(JSON.stringify(event)),
        lastEventAt: eventDate,
        sentAt: event.event === "send" ? eventDate : emailLog.sentAt,
        deliveredAt: event.event === "send" ? eventDate : emailLog.deliveredAt,
        openedAt: event.event === "open" ? eventDate : emailLog.openedAt,
        clickedAt: event.event === "click" ? eventDate : emailLog.clickedAt,
        bouncedAt: event.event === "hard_bounce" || event.event === "soft_bounce" ? eventDate : emailLog.bouncedAt,
        errorMessage:
          event.event === "reject"
            ? "Mailchimp Transactional rechazo el mensaje."
            : event.event === "hard_bounce" || event.event === "soft_bounce"
              ? "El proveedor reporto rebote del correo."
              : emailLog.errorMessage,
      },
    });
  }

  return NextResponse.json({ ok: true, processed: events.length });
}
