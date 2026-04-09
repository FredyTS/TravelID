import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { sendPortalTrackingEmail } from "@/lib/email/transactional";

function generateShareToken() {
  return randomBytes(24).toString("hex");
}

function absoluteUrl(path: string) {
  return `${env.appUrl}${path}`;
}

export async function ensureQuoteShareToken(quoteId: string) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    select: { id: true, shareToken: true },
  });

  if (quote.shareToken) {
    return quote.shareToken;
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      shareToken: generateShareToken(),
    },
    select: { shareToken: true },
  });

  return updated.shareToken!;
}

export async function ensureOrderShareToken(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { id: true, shareToken: true },
  });

  if (order.shareToken) {
    return order.shareToken;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      shareToken: generateShareToken(),
    },
    select: { shareToken: true },
  });

  return updated.shareToken!;
}

export async function ensureInquiryShareToken(inquiryId: string) {
  const inquiry = await prisma.inquiry.findUniqueOrThrow({
    where: { id: inquiryId },
    select: { id: true, shareToken: true },
  });

  if (inquiry.shareToken) {
    return inquiry.shareToken;
  }

  const updated = await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      shareToken: generateShareToken(),
    },
    select: { shareToken: true },
  });

  return updated.shareToken!;
}

export async function getQuoteShareUrl(quoteId: string) {
  const token = await ensureQuoteShareToken(quoteId);
  return absoluteUrl(`/seguimiento/cotizacion/${token}`);
}

export async function getOrderShareUrl(orderId: string) {
  const token = await ensureOrderShareToken(orderId);
  return absoluteUrl(`/seguimiento/pedido/${token}`);
}

export async function getInquiryShareUrl(inquiryId: string) {
  const token = await ensureInquiryShareToken(inquiryId);
  return absoluteUrl(`/seguimiento/solicitud/${token}`);
}

export async function sendQuoteShareLink(input: {
  quoteId: string;
  recipientEmail: string;
  actorUserId?: string;
}) {
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: input.quoteId },
    include: {
      customer: true,
    },
  });

  const shareUrl = await getQuoteShareUrl(quote.id);
  const portalUrl = absoluteUrl(`/portal/cotizaciones/${quote.id}`);

  await sendPortalTrackingEmail({
    email: input.recipientEmail,
    recipientName: quote.customer?.firstName ?? null,
    subject: `Tu cotización ${quote.quoteNumber} ya está lista`,
    intro: `Preparamos tu propuesta ${quote.title}. Puedes revisar el resumen y la propuesta compartida desde este enlace.`,
    ctaUrl: shareUrl,
    ctaLabel: "Ver cotización compartida",
    secondaryUrl: portalUrl,
    secondaryLabel: "Entrar al portal completo",
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      sentAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "QUOTE",
      entityId: quote.id,
      action: "QUOTE_LINK_SENT",
      description: `Se envio el link de la cotizacion ${quote.quoteNumber}.`,
      actorUserId: input.actorUserId,
      actorType: input.actorUserId ? "USER" : "SYSTEM",
      metadata: {
        recipientEmail: input.recipientEmail,
        shareUrl,
        portalUrl,
      },
    },
  });

  return { shareUrl, portalUrl };
}

export async function sendOrderShareLink(input: {
  orderId: string;
  recipientEmail: string;
  actorUserId?: string;
}) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: input.orderId },
    include: {
      customer: true,
    },
  });

  const shareUrl = await getOrderShareUrl(order.id);
  const portalUrl = absoluteUrl(`/portal/viajes/${order.id}`);

  await sendPortalTrackingEmail({
    email: input.recipientEmail,
    recipientName: order.customer.firstName ?? null,
    subject: `Tu pedido ${order.orderNumber} ya está disponible`,
    intro: `Ya puedes revisar el estado de tu viaje, documentos y seguimiento desde este enlace compartido.`,
    ctaUrl: shareUrl,
    ctaLabel: "Ver seguimiento compartido",
    secondaryUrl: portalUrl,
    secondaryLabel: "Entrar al portal completo",
  });

  await prisma.activityLog.create({
    data: {
      entityType: "ORDER",
      entityId: order.id,
      action: "ORDER_LINK_SENT",
      description: `Se envio el link de seguimiento del pedido ${order.orderNumber}.`,
      actorUserId: input.actorUserId,
      actorType: input.actorUserId ? "USER" : "SYSTEM",
      metadata: {
        recipientEmail: input.recipientEmail,
        shareUrl,
        portalUrl,
      },
    },
  });

  return { shareUrl, portalUrl };
}

export async function sendInquiryTrackingLink(input: {
  inquiryId: string;
  recipientEmail: string;
  recipientName?: string | null;
}) {
  const inquiry = await prisma.inquiry.findUniqueOrThrow({
    where: { id: input.inquiryId },
  });

  const shareUrl = await getInquiryShareUrl(inquiry.id);

  await sendPortalTrackingEmail({
    email: input.recipientEmail,
    recipientName: input.recipientName,
    subject: "Recibimos tu solicitud de cotización",
    intro: "Ya registramos tu solicitud. Desde este enlace podrás darle seguimiento al estado de tu petición mientras preparamos tu propuesta.",
    ctaUrl: shareUrl,
    ctaLabel: "Dar seguimiento a mi solicitud",
    secondaryUrl: absoluteUrl("/login"),
    secondaryLabel: "Entrar al portal",
  });

  await prisma.activityLog.create({
    data: {
      entityType: "INQUIRY",
      entityId: inquiry.id,
      action: "INQUIRY_LINK_SENT",
      description: `Se envio el link de seguimiento de la solicitud ${inquiry.id}.`,
      actorType: "SYSTEM",
      metadata: {
        recipientEmail: input.recipientEmail,
        shareUrl,
      },
    },
  });

  return { shareUrl };
}
