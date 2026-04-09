import { EmailDeliveryStatus, EmailProvider } from "@prisma/client";
import { Resend } from "resend";
import { prisma } from "@/lib/db/prisma";
import { getEmailSettings } from "@/features/settings/server/settings-service";
import { escapeHtml, renderTemplate } from "@/features/settings/server/template-engine";
import { getDefaultSiteTemplateVariables } from "@/features/settings/server/template-settings";

type EmailTrackingInput = {
  category: string;
  customerId?: string;
  inquiryId?: string;
  quoteId?: string;
  orderId?: string;
  conversationThreadId?: string;
  metadata?: Record<string, unknown>;
};

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  tracking?: EmailTrackingInput;
};

type MailchimpSendResult = {
  email: string;
  status: string;
  _id?: string;
  reject_reason?: string | null;
  queued_reason?: string | null;
};

function mapMailchimpStatus(status?: string | null) {
  switch (status) {
    case "queued":
      return EmailDeliveryStatus.QUEUED;
    case "sent":
    case "scheduled":
      return EmailDeliveryStatus.SENT;
    case "rejected":
    case "invalid":
      return EmailDeliveryStatus.REJECTED;
    default:
      return EmailDeliveryStatus.PENDING;
  }
}

function buildEmailTemplateVariables(input: {
  subject?: string;
  greeting?: string;
  host?: string;
  intro?: string;
  preview?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  primaryButtonColor?: string;
  secondaryLinkColor?: string;
}) {
  const ctaUrl = input.ctaUrl ?? "";
  const secondaryCtaUrl = input.secondaryCtaUrl ?? "";
  const ctaLabel = input.ctaLabel ?? "";
  const secondaryCtaLabel = input.secondaryCtaLabel ?? "";

  return {
    html: {
      ...getDefaultSiteTemplateVariables(),
      subject: escapeHtml(input.subject ?? ""),
      greeting: escapeHtml(input.greeting ?? ""),
      host: escapeHtml(input.host ?? ""),
      intro: escapeHtml(input.intro ?? ""),
      preview: escapeHtml(input.preview ?? ""),
      cta_label: escapeHtml(ctaLabel),
      cta_url: escapeHtml(ctaUrl),
      cta_button: ctaUrl
        ? `<a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:${input.primaryButtonColor ?? "#0284c7"};color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">${escapeHtml(ctaLabel)}</a>`
        : "",
      cta_link: ctaUrl ? `<a href="${escapeHtml(ctaUrl)}">${escapeHtml(ctaUrl)}</a>` : "",
      secondary_cta_label: escapeHtml(secondaryCtaLabel),
      secondary_cta_url: escapeHtml(secondaryCtaUrl),
      secondary_cta_link:
        secondaryCtaUrl && secondaryCtaLabel
          ? `<p style="margin:16px 0 0"><a href="${escapeHtml(secondaryCtaUrl)}" style="color:${input.secondaryLinkColor ?? "#0f766e"};text-decoration:none;font-weight:600">${escapeHtml(secondaryCtaLabel)}</a></p>`
          : "",
    },
    text: {
      ...getDefaultSiteTemplateVariables(),
      subject: input.subject ?? "",
      greeting: input.greeting ?? "",
      host: input.host ?? "",
      intro: input.intro ?? "",
      preview: input.preview ?? "",
      cta_label: ctaLabel,
      cta_url: ctaUrl,
      cta_button: ctaUrl,
      cta_link: ctaUrl,
      secondary_cta_label: secondaryCtaLabel,
      secondary_cta_url: secondaryCtaUrl,
      secondary_cta_link: secondaryCtaUrl,
    },
  };
}

async function createEmailLog(input: SendEmailInput, provider: EmailProvider) {
  return prisma.emailDeliveryLog.create({
    data: {
      provider,
      status: EmailDeliveryStatus.PENDING,
      category: input.tracking?.category ?? "TRANSACTIONAL",
      toEmail: input.to,
      subject: input.subject,
      customerId: input.tracking?.customerId,
      inquiryId: input.tracking?.inquiryId,
      quoteId: input.tracking?.quoteId,
      orderId: input.tracking?.orderId,
      conversationThreadId: input.tracking?.conversationThreadId,
      providerPayload: input.tracking?.metadata ? JSON.parse(JSON.stringify(input.tracking.metadata)) : undefined,
    },
  });
}

async function markEmailFailed(emailLogId: string, message: string) {
  await prisma.emailDeliveryLog.update({
    where: { id: emailLogId },
    data: {
      status: EmailDeliveryStatus.FAILED,
      errorMessage: message,
      lastEventAt: new Date(),
    },
  });
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const settings = await getEmailSettings();
  const provider = settings.activeProvider;
  const resend = settings.resendApiKey ? new Resend(settings.resendApiKey) : null;
  const resendFrom = `${settings.resendFromName} <${settings.resendFromEmail}>`;
  const emailLog = await createEmailLog(input, provider);

  try {
    if (provider === EmailProvider.MAILCHIMP_TRANSACTIONAL && settings.mailchimpTransactionalApiKey) {
      const response = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: settings.mailchimpTransactionalApiKey,
          message: {
            html: input.html,
            text: input.text,
            subject: input.subject,
            from_email: settings.mailchimpTransactionalFromEmail,
            from_name: settings.mailchimpTransactionalFromName,
            to: [{ email: input.to, type: "to" }],
            metadata: {
              emailLogId: emailLog.id,
              quoteId: input.tracking?.quoteId,
              orderId: input.tracking?.orderId,
              inquiryId: input.tracking?.inquiryId,
              customerId: input.tracking?.customerId,
              category: input.tracking?.category,
            },
            tags: [input.tracking?.category ?? "transactional"],
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        await markEmailFailed(emailLog.id, `Mailchimp Transactional devolvio un error: ${errorBody}`);
        throw new Error(`Mailchimp Transactional devolvio un error: ${errorBody}`);
      }

      const result = (await response.json()) as MailchimpSendResult[];
      const primaryResult = result[0];

      await prisma.emailDeliveryLog.update({
        where: { id: emailLog.id },
        data: {
          provider: EmailProvider.MAILCHIMP_TRANSACTIONAL,
          providerMessageId: primaryResult?._id ?? undefined,
          providerEventType: primaryResult?.status ?? "accepted",
          providerPayload: JSON.parse(JSON.stringify(result)),
          status: mapMailchimpStatus(primaryResult?.status),
          errorMessage: primaryResult?.reject_reason ?? primaryResult?.queued_reason ?? undefined,
          sentAt:
            primaryResult?.status === "sent" || primaryResult?.status === "queued" || primaryResult?.status === "scheduled"
              ? new Date()
              : undefined,
          lastEventAt: new Date(),
        },
      });

      return {
        delivered: primaryResult?.status === "sent",
        provider: "mailchimp" as const,
        emailLogId: emailLog.id,
      };
    }

    if (provider === EmailProvider.CONSOLE || !resend) {
      console.info("[email:dev-fallback]", {
        to: input.to,
        subject: input.subject,
        text: input.text,
      });

      await prisma.emailDeliveryLog.update({
        where: { id: emailLog.id },
        data: {
          provider: provider === EmailProvider.RESEND && !resend ? EmailProvider.CONSOLE : provider,
          status: EmailDeliveryStatus.SENT,
          sentAt: new Date(),
          lastEventAt: new Date(),
          providerEventType: "dev-fallback",
          providerPayload: {
            to: input.to,
            subject: input.subject,
            text: input.text,
          },
        },
      });

      return { delivered: false, provider: "console" as const, emailLogId: emailLog.id };
    }

    const resendResult = await resend.emails.send({
      from: resendFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    await prisma.emailDeliveryLog.update({
      where: { id: emailLog.id },
      data: {
        provider: EmailProvider.RESEND,
        status: EmailDeliveryStatus.SENT,
        providerMessageId: "data" in resendResult && resendResult.data?.id ? resendResult.data.id : undefined,
        providerPayload: JSON.parse(JSON.stringify(resendResult)),
        providerEventType: "accepted",
        sentAt: new Date(),
        lastEventAt: new Date(),
      },
    });

    return { delivered: true, provider: "resend" as const, emailLogId: emailLog.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible enviar el correo.";
    await markEmailFailed(emailLog.id, message);
    throw error;
  }
}

export async function sendMagicLinkEmail(input: {
  email: string;
  url: string;
  host: string;
}) {
  const settings = await getEmailSettings();
  const variables = buildEmailTemplateVariables({
    subject: "Tu acceso a tu portal",
    greeting: "Hola,",
    host: input.host,
    ctaLabel: "Entrar a mi portal",
    ctaUrl: input.url,
    primaryButtonColor: "#0f766e",
  });

  return sendTransactionalEmail({
    to: input.email,
    subject: renderTemplate(settings.templates.magicLinkEmail.subject, variables.text),
    text: renderTemplate(settings.templates.magicLinkEmail.text, variables.text),
    html: renderTemplate(settings.templates.magicLinkEmail.html, variables.html),
    tracking: {
      category: "MAGIC_LINK",
      metadata: {
        host: input.host,
      },
    },
  });
}

export async function sendConversationNotificationEmail(input: {
  email: string;
  recipientName?: string | null;
  subject: string;
  preview: string;
  ctaUrl: string;
  ctaLabel: string;
  tracking?: EmailTrackingInput;
}) {
  const greeting = input.recipientName ? `Hola ${input.recipientName},` : "Hola,";
  const settings = await getEmailSettings();
  const variables = buildEmailTemplateVariables({
    subject: input.subject,
    greeting,
    preview: input.preview,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    primaryButtonColor: "#1d4ed8",
  });

  return sendTransactionalEmail({
    to: input.email,
    subject: renderTemplate(settings.templates.conversationNotificationEmail.subject, variables.text),
    text: renderTemplate(settings.templates.conversationNotificationEmail.text, variables.text),
    html: renderTemplate(settings.templates.conversationNotificationEmail.html, variables.html),
    tracking: {
      category: "CONVERSATION_NOTIFICATION",
      ...input.tracking,
    },
  });
}

export async function sendPortalTrackingEmail(input: {
  email: string;
  recipientName?: string | null;
  subject: string;
  intro: string;
  ctaUrl: string;
  ctaLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
  tracking?: EmailTrackingInput;
}) {
  const greeting = input.recipientName ? `Hola ${input.recipientName},` : "Hola,";
  const settings = await getEmailSettings();
  const variables = buildEmailTemplateVariables({
    subject: input.subject,
    greeting,
    intro: input.intro,
    ctaLabel: input.ctaLabel,
    ctaUrl: input.ctaUrl,
    secondaryCtaLabel: input.secondaryLabel,
    secondaryCtaUrl: input.secondaryUrl,
    primaryButtonColor: "#0284c7",
    secondaryLinkColor: "#0f766e",
  });

  return sendTransactionalEmail({
    to: input.email,
    subject: renderTemplate(settings.templates.portalTrackingEmail.subject, variables.text),
    text: renderTemplate(settings.templates.portalTrackingEmail.text, variables.text),
    html: renderTemplate(settings.templates.portalTrackingEmail.html, variables.html),
    tracking: {
      category: "PORTAL_TRACKING",
      ...input.tracking,
    },
  });
}
