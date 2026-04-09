import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const [recentActivity, recentEmails, recentWebhookEvents] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.emailDeliveryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.emailWebhookEventLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="surface space-y-4 p-8 text-slate-900">
        <h1 className="text-4xl">Actividad y auditoria</h1>
        <p className="text-slate-600">
          Timeline operacional, auditoria de cambios y bitacora de correos para revisar si realmente salieron,
          fallaron o fueron confirmados por webhook.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Actividad operativa reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">{entry.action}</p>
                  <p className="text-xs text-slate-500">{entry.createdAt.toLocaleString("es-MX")}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{entry.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {entry.entityType} · {entry.entityId}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Bitacora de correos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEmails.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">{entry.subject}</p>
                  <p className="text-xs text-slate-500">{entry.createdAt.toLocaleString("es-MX")}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{entry.toEmail}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {entry.provider} · {entry.status} · {entry.category}
                </p>
                {entry.errorMessage ? <p className="mt-2 text-sm text-rose-600">{entry.errorMessage}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Eventos de webhook de Mailchimp Transactional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentWebhookEvents.length > 0 ? (
            recentWebhookEvents.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">{entry.eventType}</p>
                  <p className="text-xs text-slate-500">{entry.createdAt.toLocaleString("es-MX")}</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Mensaje proveedor: {entry.providerMessageId ?? "Sin message id"} · Log relacionado:{" "}
                  {entry.emailLogId ?? "No vinculado"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">Aun no se reciben eventos del webhook de Mailchimp Transactional.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
