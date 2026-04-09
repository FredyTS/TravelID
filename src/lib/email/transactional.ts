import { EmailDeliveryStatus, EmailProvider } from "@prisma/client";
import { Resend } from "resend";
import { prisma } from "@/lib/db/prisma";
import { getEmailSettings } from "@/features/settings/server/settings-service";

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
  return sendTransactionalEmail({
    to: input.email,
    subject: "Tu acceso a Alondra Travel MX",
    text: `Tu cuenta ya esta lista. Abre este enlace para entrar a tu portal: ${input.url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>Tu portal de viaje esta listo</h2>
        <p>Haz clic en el siguiente boton para entrar a tu cuenta en ${input.host}.</p>
        <p style="margin:24px 0">
          <a href="${input.url}" style="background:#0f766e;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">
            Entrar a mi portal
          </a>
        </p>
        <p>Si el boton no abre, usa este enlace:</p>
        <p><a href="${input.url}">${input.url}</a></p>
      </div>
    `,
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

  return sendTransactionalEmail({
    to: input.email,
    subject: input.subject,
    text: `${greeting}\n\n${input.preview}\n\nRevisa el mensaje aqui: ${input.ctaUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>${greeting}</p>
        <p>${input.preview}</p>
        <p style="margin:24px 0">
          <a href="${input.ctaUrl}" style="background:#1d4ed8;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">
            ${input.ctaLabel}
          </a>
        </p>
        <p>Si el boton no abre, entra aqui:</p>
        <p><a href="${input.ctaUrl}">${input.ctaUrl}</a></p>
      </div>
    `,
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

  const secondaryBlock =
    input.secondaryUrl && input.secondaryLabel
      ? `
        <p style="margin:16px 0 0">
          <a href="${input.secondaryUrl}" style="color:#0f766e;text-decoration:none;font-weight:600">
            ${input.secondaryLabel}
          </a>
        </p>
      `
      : "";

  return sendTransactionalEmail({
    to: input.email,
    subject: input.subject,
    text: `${greeting}\n\n${input.intro}\n\nAbre aqui: ${input.ctaUrl}${input.secondaryUrl ? `\n\nPortal: ${input.secondaryUrl}` : ""}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:640px;margin:0 auto">
        <div style="padding:24px 0 12px">
          <p style="margin:0;font-size:14px;color:#0f766e;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">Alondra Travel MX</p>
          <h2 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#0f172a">Seguimiento de tu viaje</h2>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:24px;padding:24px">
          <p>${greeting}</p>
          <p>${input.intro}</p>
          <p style="margin:24px 0">
            <a href="${input.ctaUrl}" style="display:inline-block;background:#0284c7;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">
              ${input.ctaLabel}
            </a>
          </p>
          ${secondaryBlock}
          <p style="margin-top:20px;color:#475569;font-size:14px">Si el botón no abre, copia este enlace:</p>
          <p style="word-break:break-word"><a href="${input.ctaUrl}">${input.ctaUrl}</a></p>
        </div>
      </div>
    `,
    tracking: {
      category: "PORTAL_TRACKING",
      ...input.tracking,
    },
  });
}
