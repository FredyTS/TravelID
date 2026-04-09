"use client";

import { useState, useTransition } from "react";
import { EmailProvider } from "@prisma/client";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CommunicationSettings } from "@/features/settings/server/settings-service";
import { emailTemplateTagGroups, quoteTemplateTagGroups } from "@/features/settings/server/template-settings";

type EmailSettingsFormState = CommunicationSettings;

function TemplateTagList({
  title,
  groups,
}: {
  title: string;
  groups: readonly { title: string; tags: readonly string[] }[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <div className="mt-4 space-y-4 text-sm text-slate-600">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="font-medium text-slate-800">{group.title}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.tags.map((tag) => (
                <code key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
                  {tag}
                </code>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  function updateTemplate<K extends keyof EmailSettingsFormState["templates"]>(
    key: K,
    value: EmailSettingsFormState["templates"][K],
  ) {
    setValues((current) => ({
      ...current,
      templates: {
        ...current.templates,
        [key]: value,
      },
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
      <Tabs defaultValue="provider">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="provider">Proveedor</TabsTrigger>
          <TabsTrigger value="emails">Plantillas email</TabsTrigger>
          <TabsTrigger value="quote-html">Plantilla cotizacion HTML</TabsTrigger>
          <TabsTrigger value="quote-pdf">Plantilla PDF</TabsTrigger>
        </TabsList>

        <TabsContent value="provider" className="space-y-6 pt-4">
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
              El cambio se aplica al siguiente correo, sin redeploy. Las plantillas de abajo funcionan con cualquier proveedor.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-950">Resend</h2>
              <p className="mt-2 text-sm text-slate-500">Ideal para transactional simple y barato.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">API key</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.resendApiKey} onChange={(event) => updateField("resendApiKey", event.target.value)} placeholder="re_xxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Correo remitente</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.resendFromEmail} onChange={(event) => updateField("resendFromEmail", event.target.value)} placeholder="noreply@alondratravelmx.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre remitente</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.resendFromName} onChange={(event) => updateField("resendFromName", event.target.value)} placeholder="Alondra Travel MX" />
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-950">Mailchimp Transactional</h2>
              <p className="mt-2 text-sm text-slate-500">Disponible si despues quieres volver a usarlo.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">API key</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.mailchimpTransactionalApiKey} onChange={(event) => updateField("mailchimpTransactionalApiKey", event.target.value)} placeholder="md_xxxxxxxxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Correo remitente</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.mailchimpTransactionalFromEmail} onChange={(event) => updateField("mailchimpTransactionalFromEmail", event.target.value)} placeholder="noreply@alondratravelmx.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre remitente</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.mailchimpTransactionalFromName} onChange={(event) => updateField("mailchimpTransactionalFromName", event.target.value)} placeholder="Alondra Travel MX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Webhook key</label>
                  <Input className="mt-2 h-10 rounded-xl" value={values.mailchimpTransactionalWebhookKey} onChange={(event) => updateField("mailchimpTransactionalWebhookKey", event.target.value)} placeholder="clave privada para validar webhook" />
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="space-y-6 pt-4">
          <TemplateTagList title="Tags disponibles para correos" groups={emailTemplateTagGroups} />

          <div className="grid gap-6">
            {[
              { key: "magicLinkEmail", title: "Acceso por email" },
              { key: "conversationNotificationEmail", title: "Notificacion de conversacion" },
              { key: "portalTrackingEmail", title: "Seguimiento / cotizacion / portal" },
            ].map((template) => {
              const value = values.templates[template.key as keyof typeof values.templates] as {
                subject: string;
                html: string;
              };

              return (
                <section key={template.key} className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-950">{template.title}</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Asunto</label>
                      <Input
                        className="mt-2"
                        value={value.subject}
                        onChange={(event) =>
                          updateTemplate(template.key as keyof typeof values.templates, {
                            ...value,
                            subject: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">HTML</label>
                      <p className="mt-2 text-sm text-slate-500">
                        El texto plano se genera automaticamente desde este HTML cuando se envia el correo.
                      </p>
                      <Textarea
                        className="mt-3 min-h-64 font-mono text-xs"
                        value={value.html}
                        onChange={(event) =>
                          updateTemplate(template.key as keyof typeof values.templates, {
                            ...value,
                            html: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="quote-html" className="space-y-6 pt-4">
          <TemplateTagList title="Tags disponibles para la propuesta HTML" groups={quoteTemplateTagGroups} />
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-950">Plantilla HTML de la cotizacion</h3>
            <p className="mt-2 text-sm text-slate-500">
              Aqui puedes editar el HTML base que se guarda en la cotizacion y se muestra en la propuesta compartida.
            </p>
            <Textarea
              className="mt-4 min-h-[34rem] font-mono text-xs"
              value={values.templates.quoteProposalHtmlTemplate}
              onChange={(event) => updateTemplate("quoteProposalHtmlTemplate", event.target.value)}
            />
          </section>
        </TabsContent>

        <TabsContent value="quote-pdf" className="space-y-6 pt-4">
          <TemplateTagList title="Tags disponibles para textos del PDF" groups={quoteTemplateTagGroups} />
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-950">Textos editables del PDF</h3>
            <p className="mt-2 text-sm text-slate-500">
              El layout del PDF se mantiene estable, pero puedes cambiar encabezados, subtitulos y notas usando tags.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(
                [
                  ["documentTitle", "Titulo principal"],
                  ["documentSubtitle", "Subtitulo principal"],
                  ["tripSectionTitle", "Titulo datos del viaje"],
                  ["hotelsSectionTitle", "Titulo hoteles"],
                  ["hotelsSectionSubtitle", "Subtitulo hoteles"],
                  ["flightsSectionTitle", "Titulo vuelos"],
                  ["flightsSectionSubtitle", "Subtitulo vuelos"],
                  ["transfersSectionTitle", "Titulo traslados"],
                  ["transfersSectionSubtitle", "Subtitulo traslados"],
                  ["financialSummaryTitle", "Titulo resumen financiero"],
                  ["financialSummaryNote", "Nota resumen financiero"],
                  ["footerNote", "Nota pie de pagina"],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{label}</label>
                  <Textarea
                    className="min-h-24"
                    value={values.templates.quoteProposalPdf[field]}
                    onChange={(event) =>
                      updateTemplate("quoteProposalPdf", {
                        ...values.templates.quoteProposalPdf,
                        [field]: event.target.value,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>

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
