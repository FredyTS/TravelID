import { EmailProvider } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import {
  getDefaultConversationEmailTemplate,
  getDefaultMagicLinkEmailTemplate,
  getDefaultPortalTrackingEmailTemplate,
  getDefaultQuotePdfTemplate,
  getDefaultQuoteProposalHtmlTemplate,
} from "@/features/settings/server/template-settings";

const EMAIL_SETTINGS_KEY = "EMAIL_DELIVERY";
const COMMUNICATION_TEMPLATES_KEY = "COMMUNICATION_TEMPLATES";

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

export type EmailTemplateConfig = {
  subject: string;
  html: string;
  text: string;
};

export type QuotePdfTemplateConfig = {
  documentTitle: string;
  documentSubtitle: string;
  tripSectionTitle: string;
  hotelsSectionTitle: string;
  hotelsSectionSubtitle: string;
  flightsSectionTitle: string;
  flightsSectionSubtitle: string;
  transfersSectionTitle: string;
  transfersSectionSubtitle: string;
  financialSummaryTitle: string;
  financialSummaryNote: string;
  footerNote: string;
};

export type CommunicationTemplateSettings = {
  magicLinkEmail: EmailTemplateConfig;
  conversationNotificationEmail: EmailTemplateConfig;
  portalTrackingEmail: EmailTemplateConfig;
  quoteProposalHtmlTemplate: string;
  quoteProposalPdf: QuotePdfTemplateConfig;
};

export type CommunicationSettings = EmailSettings & {
  templates: CommunicationTemplateSettings;
};

type StoredEmailSettings = Partial<Record<keyof EmailSettings, string>> & {
  activeProvider?: EmailProvider;
};

type StoredCommunicationTemplates = Partial<CommunicationTemplateSettings>;

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

async function getStoredEmailSettings() {
  const setting = await prisma.setting.findUnique({
    where: { key: EMAIL_SETTINGS_KEY },
  });

  return (setting?.value ?? {}) as StoredEmailSettings;
}

async function getStoredCommunicationTemplates() {
  const setting = await prisma.setting.findUnique({
    where: { key: COMMUNICATION_TEMPLATES_KEY },
  });

  return (setting?.value ?? {}) as StoredCommunicationTemplates;
}

export async function getEmailSettings(): Promise<CommunicationSettings> {
  const stored = await getStoredEmailSettings();
  const storedTemplates = await getStoredCommunicationTemplates();
  const parsedFrom = parseFromHeader(env.emailFrom);
  const defaultMagicLink = getDefaultMagicLinkEmailTemplate();
  const defaultConversation = getDefaultConversationEmailTemplate();
  const defaultPortalTracking = getDefaultPortalTrackingEmailTemplate();
  const defaultQuotePdf = getDefaultQuotePdfTemplate();

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
    templates: {
      magicLinkEmail: {
        subject: storedTemplates.magicLinkEmail?.subject ?? defaultMagicLink.subject,
        html: storedTemplates.magicLinkEmail?.html ?? defaultMagicLink.html,
        text: storedTemplates.magicLinkEmail?.text ?? defaultMagicLink.text,
      },
      conversationNotificationEmail: {
        subject: storedTemplates.conversationNotificationEmail?.subject ?? defaultConversation.subject,
        html: storedTemplates.conversationNotificationEmail?.html ?? defaultConversation.html,
        text: storedTemplates.conversationNotificationEmail?.text ?? defaultConversation.text,
      },
      portalTrackingEmail: {
        subject: storedTemplates.portalTrackingEmail?.subject ?? defaultPortalTracking.subject,
        html: storedTemplates.portalTrackingEmail?.html ?? defaultPortalTracking.html,
        text: storedTemplates.portalTrackingEmail?.text ?? defaultPortalTracking.text,
      },
      quoteProposalHtmlTemplate:
        storedTemplates.quoteProposalHtmlTemplate ?? getDefaultQuoteProposalHtmlTemplate(),
      quoteProposalPdf: {
        documentTitle: storedTemplates.quoteProposalPdf?.documentTitle ?? defaultQuotePdf.documentTitle,
        documentSubtitle: storedTemplates.quoteProposalPdf?.documentSubtitle ?? defaultQuotePdf.documentSubtitle,
        tripSectionTitle: storedTemplates.quoteProposalPdf?.tripSectionTitle ?? defaultQuotePdf.tripSectionTitle,
        hotelsSectionTitle: storedTemplates.quoteProposalPdf?.hotelsSectionTitle ?? defaultQuotePdf.hotelsSectionTitle,
        hotelsSectionSubtitle:
          storedTemplates.quoteProposalPdf?.hotelsSectionSubtitle ?? defaultQuotePdf.hotelsSectionSubtitle,
        flightsSectionTitle:
          storedTemplates.quoteProposalPdf?.flightsSectionTitle ?? defaultQuotePdf.flightsSectionTitle,
        flightsSectionSubtitle:
          storedTemplates.quoteProposalPdf?.flightsSectionSubtitle ?? defaultQuotePdf.flightsSectionSubtitle,
        transfersSectionTitle:
          storedTemplates.quoteProposalPdf?.transfersSectionTitle ?? defaultQuotePdf.transfersSectionTitle,
        transfersSectionSubtitle:
          storedTemplates.quoteProposalPdf?.transfersSectionSubtitle ?? defaultQuotePdf.transfersSectionSubtitle,
        financialSummaryTitle:
          storedTemplates.quoteProposalPdf?.financialSummaryTitle ?? defaultQuotePdf.financialSummaryTitle,
        financialSummaryNote:
          storedTemplates.quoteProposalPdf?.financialSummaryNote ?? defaultQuotePdf.financialSummaryNote,
        footerNote: storedTemplates.quoteProposalPdf?.footerNote ?? defaultQuotePdf.footerNote,
      },
    },
  };
}

export async function updateEmailSettings(input: CommunicationSettings) {
  await prisma.setting.upsert({
    where: { key: EMAIL_SETTINGS_KEY },
    update: {
      value: {
        activeProvider: input.activeProvider,
        resendApiKey: input.resendApiKey,
        resendFromEmail: input.resendFromEmail,
        resendFromName: input.resendFromName,
        mailchimpTransactionalApiKey: input.mailchimpTransactionalApiKey,
        mailchimpTransactionalFromEmail: input.mailchimpTransactionalFromEmail,
        mailchimpTransactionalFromName: input.mailchimpTransactionalFromName,
        mailchimpTransactionalWebhookKey: input.mailchimpTransactionalWebhookKey,
      },
    },
    create: {
      key: EMAIL_SETTINGS_KEY,
      value: {
        activeProvider: input.activeProvider,
        resendApiKey: input.resendApiKey,
        resendFromEmail: input.resendFromEmail,
        resendFromName: input.resendFromName,
        mailchimpTransactionalApiKey: input.mailchimpTransactionalApiKey,
        mailchimpTransactionalFromEmail: input.mailchimpTransactionalFromEmail,
        mailchimpTransactionalFromName: input.mailchimpTransactionalFromName,
        mailchimpTransactionalWebhookKey: input.mailchimpTransactionalWebhookKey,
      },
    },
  });

  return prisma.setting.upsert({
    where: { key: COMMUNICATION_TEMPLATES_KEY },
    update: {
      value: input.templates,
    },
    create: {
      key: COMMUNICATION_TEMPLATES_KEY,
      value: input.templates,
    },
  });
}
