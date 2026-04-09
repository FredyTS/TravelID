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
