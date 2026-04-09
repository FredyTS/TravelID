import { EmailProvider } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

const EMAIL_SETTINGS_KEY = "EMAIL_DELIVERY";

export type EmailSettings = {
  activeProvider: EmailProvider;
  resendApiKey: string;
  resendFromEmail: string;
  resendFromName: string;
  mailchimpTransactionalApiKey: string;
  mailchimpTransactionalFromEmail: string;
  mailchimpTransactionalFromName: string;
  mailchimpTransactionalWebhookKey: string;
};

type StoredEmailSettings = Partial<Record<keyof EmailSettings, string>> & {
  activeProvider?: EmailProvider;
};

function parseFromHeader(from: string | undefined) {
  if (!from) {
    return {
      email: "noreply@alondratravelmx.com",
      name: "Alondra Travel MX",
    };
  }

  const match = from.match(/^(.*)<([^>]+)>$/);

  if (!match) {
    return {
      email: from.trim(),
      name: "Alondra Travel MX",
    };
  }

  return {
    name: match[1].trim().replace(/^"|"$/g, "") || "Alondra Travel MX",
    email: match[2].trim(),
  };
}

function getDefaultProvider() {
  if (env.resendApiKey) {
    return EmailProvider.RESEND;
  }

  if (env.mailchimpTransactionalApiKey) {
    return EmailProvider.MAILCHIMP_TRANSACTIONAL;
  }

  return EmailProvider.CONSOLE;
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const setting = await prisma.setting.findUnique({
    where: { key: EMAIL_SETTINGS_KEY },
  });

  const stored = (setting?.value ?? {}) as StoredEmailSettings;
  const parsedFrom = parseFromHeader(env.emailFrom);

  return {
    activeProvider: stored.activeProvider ?? getDefaultProvider(),
    resendApiKey: stored.resendApiKey ?? env.resendApiKey ?? "",
    resendFromEmail: stored.resendFromEmail ?? parsedFrom.email,
    resendFromName: stored.resendFromName ?? parsedFrom.name,
    mailchimpTransactionalApiKey: stored.mailchimpTransactionalApiKey ?? env.mailchimpTransactionalApiKey ?? "",
    mailchimpTransactionalFromEmail:
      stored.mailchimpTransactionalFromEmail ?? env.mailchimpTransactionalFromEmail ?? "noreply@alondratravelmx.com",
    mailchimpTransactionalFromName:
      stored.mailchimpTransactionalFromName ?? env.mailchimpTransactionalFromName ?? "Alondra Travel MX",
    mailchimpTransactionalWebhookKey:
      stored.mailchimpTransactionalWebhookKey ?? env.mailchimpTransactionalWebhookKey ?? "",
  };
}

export async function updateEmailSettings(input: EmailSettings) {
  return prisma.setting.upsert({
    where: { key: EMAIL_SETTINGS_KEY },
    update: {
      value: input,
    },
    create: {
      key: EMAIL_SETTINGS_KEY,
      value: input,
    },
  });
}
