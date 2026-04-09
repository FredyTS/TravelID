export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "dev-secret",
  databaseUrl: process.env.DATABASE_URL,
  resendApiKey: process.env.RESEND_API_KEY,
  mailchimpTransactionalApiKey: process.env.MAILCHIMP_TRANSACTIONAL_API_KEY,
  mailchimpTransactionalFromEmail:
    process.env.MAILCHIMP_TRANSACTIONAL_FROM_EMAIL ?? "noreply@alondratravelmx.com",
  mailchimpTransactionalFromName:
    process.env.MAILCHIMP_TRANSACTIONAL_FROM_NAME ?? "Alondra Travel MX",
  mailchimpTransactionalWebhookKey: process.env.MAILCHIMP_TRANSACTIONAL_WEBHOOK_KEY,
  emailFrom: process.env.EMAIL_FROM ?? "Alondra Travel MX <noreply@alondratravelmx.com>",
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  mercadoPagoPublicKey: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY,
  mercadoPagoWebhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2Bucket: process.env.R2_BUCKET,
  r2PublicUrl: process.env.R2_PUBLIC_URL,
  seedSuperadminEmail: process.env.SEED_SUPERADMIN_EMAIL ?? "admin@alondratravelmx.com",
  seedSuperadminPassword: process.env.SEED_SUPERADMIN_PASSWORD ?? "ChangeMe123!",
};
