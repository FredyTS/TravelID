import { NextResponse } from "next/server";
import { EmailProvider } from "@prisma/client";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guards";
import { getEmailSettings, updateEmailSettings } from "@/features/settings/server/settings-service";

const emailSettingsSchema = z.object({
  activeProvider: z.nativeEnum(EmailProvider),
  resendApiKey: z.string().default(""),
  resendFromEmail: z.string().email(),
  resendFromName: z.string().min(2),
  mailchimpTransactionalApiKey: z.string().default(""),
  mailchimpTransactionalFromEmail: z.string().email(),
  mailchimpTransactionalFromName: z.string().min(2),
  mailchimpTransactionalWebhookKey: z.string().default(""),
});

export async function GET() {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const settings = await getEmailSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });
  }

  const json = await request.json();
  const settings = emailSettingsSchema.parse(json);

  await updateEmailSettings(settings);

  return NextResponse.json({
    ok: true,
    message: "La configuracion de correo se actualizo y se aplicara al siguiente envio.",
  });
}
