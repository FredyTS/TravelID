import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { getPortalOverview } from "@/features/portal/server/portal-service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCheckoutButton } from "@/features/payments/components/create-checkout-button";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const session = await requireCustomerSession();

  if (!session?.user.customerId) {
    return null;
  }

  const overview = await getPortalOverview(session.user.customerId);
  const nextPendingSchedule = overview.activeOrder?.paymentSchedules.find((item) => item.status === "PENDING");
  const unreadMessages = overview.threads.reduce((acc, thread) => acc + thread._count.messages, 0);

  return (
    <div className="space-y-6">
      <div className="surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">
              Bienvenido a tu portal
            </p>
            <h1 className="mt-3 text-4xl">
              {[overview.customer?.firstName, overview.customer?.lastName].filter(Boolean).join(" ") || "Tu viaje"}
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Aqui puedes revisar el estatus de tu reservacion, pagar tus pendientes, descargar documentos y escribirnos directo para cualquier duda.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-950 px-5 py-4 text-white shadow-xl shadow-slate-950/15">
            <p className="text-sm text-slate-300">Mensajes sin leer</p>
            <p className="mt-2 text-3xl font-semibold">{unreadMessages}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader><CardTitle className="text-base">Pedidos visibles</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{overview.orders.length}</p></CardContent>
        </Card>
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader><CardTitle className="text-base">Saldo total</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{formatCurrency(overview.orders.reduce((acc, order) => acc + Number(order.balanceDue), 0))}</p></CardContent>
        </Card>
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader><CardTitle className="text-base">Documentos</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{overview.documents.length}</p></CardContent>
        </Card>
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader><CardTitle className="text-base">Conversaciones</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{overview.threads.length}</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Tu siguiente viaje</CardTitle>
              <p className="mt-2 text-sm text-slate-600">Seguimiento operativo, cobranza y documentos de tu reservacion activa.</p>
            </div>
            {overview.activeOrder ? <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{overview.activeOrder.status}</Badge> : null}
          </CardHeader>
          <CardContent>
            {overview.activeOrder ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 rounded-[1.75rem] bg-slate-50 p-5">
                  <div>
                    <p className="text-2xl font-semibold text-slate-950">{overview.activeOrder.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{overview.activeOrder.orderNumber}</p>
                    <p className="mt-3 text-sm text-slate-600">
                      {overview.activeOrder.departureDate
                        ? `Salida estimada: ${overview.activeOrder.departureDate.toLocaleDateString("es-MX")}`
                        : "Fecha de salida por confirmar"}
                    </p>
                  </div>
                  <div className="min-w-52 rounded-[1.5rem] bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-500">Saldo pendiente</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {formatCurrency(Number(overview.activeOrder.balanceDue))}
                    </p>
                  </div>
                </div>

                {nextPendingSchedule ? (
                  <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-emerald-900">
                          Tienes un pago pendiente: {nextPendingSchedule.dueType}
                        </p>
                        <p className="mt-1 text-sm text-emerald-800/80">
                          Monto: {formatCurrency(Number(nextPendingSchedule.amount))} · vence {nextPendingSchedule.dueDate.toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <div className="w-full max-w-xs">
                        <CreateCheckoutButton
                          orderId={overview.activeOrder.id}
                          scheduleId={nextPendingSchedule.id}
                          audience="client"
                          label="Pagar ahora con Mercado Pago"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-3">
                  {overview.activeOrder.travelUpdates.map((update) => (
                    <div key={update.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                      <p className="font-medium text-slate-950">{update.title}</p>
                      <p className="mt-2 text-sm text-slate-600">{update.message}</p>
                    </div>
                  ))}
                </div>

                <Link href={`/portal/viajes/${overview.activeOrder.id}`} className="inline-flex text-sm font-medium text-primary hover:underline">
                  Ver detalle completo del viaje
                </Link>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                Aun no vemos un pedido visible en tu portal. Cuando tu reservacion quede lista, aparecera aqui con pagos, documentos y seguimiento.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Conversaciones</CardTitle>
              <Link href="/portal/inbox" className="text-sm font-medium text-primary hover:underline">
                Abrir inbox
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.threads.length > 0 ? (
                overview.threads.map((thread) => (
                  <Link key={thread.id} href={`/portal/inbox/${thread.id}`} className="block rounded-[1.5rem] border border-slate-200 p-4 hover:border-primary">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{thread.subject}</p>
                      {thread._count.messages > 0 ? (
                        <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
                          {thread._count.messages} nuevos
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {thread.messages[0]?.body ?? "Sin mensajes aun"}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-600">Todavia no tienes conversaciones abiertas.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos recientes</CardTitle>
              <Link href="/portal/documentos" className="text-sm font-medium text-primary hover:underline">
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.documents.length > 0 ? (
                overview.documents.map((document) => (
                  <div key={document.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <p className="font-medium text-slate-950">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{document.type}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No hay documentos visibles todavia.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
