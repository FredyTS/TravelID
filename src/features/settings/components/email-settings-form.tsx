"use client";

import { useState, useTransition } from "react";
import { EmailProvider } from "@prisma/client";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EmailSettingsFormState = {
  activeProvider: EmailProvider;
  resendApiKey: string;
  resendFromEmail: string;
  resendFromName: string;
  mailchimpTransactionalApiKey: string;
  mailchimpTransactionalFromEmail: string;
  mailchimpTransactionalFromName: string;
  mailchimpTransactionalWebhookKey: string;
};

export function EmailSettingsForm({ initialValues }: { initialValues: EmailSettingsFormState }) {
  const [values, setValues] = useState<EmailSettingsFormState>(initialValues);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof EmailSettingsFormState>(key: K, value: EmailSettingsFormState[K]) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function submit() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible guardar la configuracion.");
        return;
      }

      setMessage(result.message ?? "Configuracion guardada.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-medium text-slate-700">Proveedor activo</label>
        <select
          value={values.activeProvider}
          onChange={(event) => updateField("activeProvider", event.target.value as EmailProvider)}
          className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-500"
        >
          <option value={EmailProvider.RESEND}>Resend</option>
          <option value={EmailProvider.MAILCHIMP_TRANSACTIONAL}>Mailchimp Transactional</option>
          <option value={EmailProvider.CONSOLE}>Consola / desarrollo</option>
        </select>
        <p className="mt-2 text-sm text-slate-500">
          El cambio se aplica al siguiente correo, sin redeploy. Puedes migrar entre Resend y Mailchimp solo
          cambiando estos parametros.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">Resend</h2>
          <p className="mt-2 text-sm text-slate-500">Ideal para transactional simple y barato.</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">API key</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.resendApiKey}
                onChange={(event) => updateField("resendApiKey", event.target.value)}
                placeholder="re_xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Correo remitente</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.resendFromEmail}
                onChange={(event) => updateField("resendFromEmail", event.target.value)}
                placeholder="noreply@alondratravelmx.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre remitente</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.resendFromName}
                onChange={(event) => updateField("resendFromName", event.target.value)}
                placeholder="Alondra Travel MX"
              />
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-950">Mailchimp Transactional</h2>
          <p className="mt-2 text-sm text-slate-500">Disponible si despues quieres volver a usarlo.</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">API key</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.mailchimpTransactionalApiKey}
                onChange={(event) => updateField("mailchimpTransactionalApiKey", event.target.value)}
                placeholder="md_xxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Correo remitente</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.mailchimpTransactionalFromEmail}
                onChange={(event) => updateField("mailchimpTransactionalFromEmail", event.target.value)}
                placeholder="noreply@alondratravelmx.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre remitente</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.mailchimpTransactionalFromName}
                onChange={(event) => updateField("mailchimpTransactionalFromName", event.target.value)}
                placeholder="Alondra Travel MX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Webhook key</label>
              <Input
                className="mt-2 h-10 rounded-xl"
                value={values.mailchimpTransactionalWebhookKey}
                onChange={(event) => updateField("mailchimpTransactionalWebhookKey", event.target.value)}
                placeholder="clave privada para validar webhook"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={submit} disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar configuracion"
          )}
        </Button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}
