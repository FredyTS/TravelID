import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { EmailSettingsForm } from "@/features/settings/components/email-settings-form";
import { getEmailSettings } from "@/features/settings/server/settings-service";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const emailSettings = await getEmailSettings();

  return (
    <div className="space-y-6">
      <div className="surface space-y-4 p-8 text-slate-900">
        <h1 className="text-4xl">Settings</h1>
        <p className="text-slate-600">
          Configuracion global para marca, pagos, emails, storage y defaults operativos. Los cambios aqui aplican sin
          redeploy.
        </p>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Correo transaccional</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailSettingsForm initialValues={emailSettings} />
          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-950">Webhook de Mailchimp Transactional</p>
            <p className="mt-2">
              Si activas Mailchimp Transactional, configura este endpoint en su panel:
            </p>
            <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-xs text-slate-800">
              {siteConfig.url}/api/webhooks/mailchimp-transactional?key=TU_WEBHOOK_KEY
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
