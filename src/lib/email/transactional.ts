import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(input: SendEmailInput) {
  if (env.mailchimpTransactionalApiKey) {
    const response = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: env.mailchimpTransactionalApiKey,
        message: {
          html: input.html,
          text: input.text,
          subject: input.subject,
          from_email: env.mailchimpTransactionalFromEmail,
          from_name: env.mailchimpTransactionalFromName,
          to: [{ email: input.to, type: "to" }],
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Mailchimp Transactional devolvio un error: ${errorBody}`);
    }

    return { delivered: true, provider: "mailchimp" as const };
  }

  if (!resend) {
    console.info("[email:dev-fallback]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return { delivered: false, provider: "console" as const };
  }

  await resend.emails.send({
    from: env.emailFrom,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { delivered: true, provider: "resend" as const };
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
  });
}

export async function sendConversationNotificationEmail(input: {
  email: string;
  recipientName?: string | null;
  subject: string;
  preview: string;
  ctaUrl: string;
  ctaLabel: string;
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
  });
}
