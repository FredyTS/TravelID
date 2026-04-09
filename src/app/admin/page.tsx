import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { getAdminDashboardOverview } from "@/features/admin/server/dashboard-service";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const overview = await getAdminDashboardOverview();

  return (
    <div className="space-y-8">
      <section className="surface p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Operacion comercial</p>
            <h1 className="mt-3 text-3xl sm:text-4xl">Dashboard de ventas y seguimiento</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Revisa cotizaciones, pedidos, conversaciones con clientes y cobranza pendiente desde una sola vista.
            </p>
          </div>
          <Link
            href="/admin/conversations"
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-slate-950/15 sm:w-auto"
          >
            <MessageSquareText className="mr-2 size-4" />
            Abrir conversaciones
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.stats.map((item) => (
          <Card key={item.label} className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base text-slate-600">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-950">
                {item.label === "Cobranza pendiente" ? formatCurrency(item.value) : item.value}
              </p>
              <p className="mt-2 text-sm text-slate-500">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <CardTitle>Pedidos recientes</CardTitle>
            <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">
              Ver pedidos
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-[1.5rem] border border-slate-200 p-4 hover:border-primary">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{order.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{order.status}</Badge>
                    <p className="mt-2 text-sm font-medium text-slate-950">{formatCurrency(Number(order.balanceDue))}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle>Cotizaciones por seguir</CardTitle>
              <Link href="/admin/quotes" className="text-sm font-medium text-primary hover:underline">
                Ver cotizaciones
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.recentQuotes.map((quote) => (
                <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="block rounded-[1.5rem] border border-slate-200 p-4 hover:border-primary">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{quote.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{quote.quoteNumber}</p>
                    </div>
                    <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">{quote.status}</Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <CardTitle>Clientes esperando respuesta</CardTitle>
              <Link href="/admin/conversations" className="text-sm font-medium text-primary hover:underline">
                Abrir inbox
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.unreadConversations.map((thread) => (
                <Link key={thread.id} href={`/admin/conversations/${thread.id}`} className="block rounded-[1.5rem] border border-slate-200 p-4 hover:border-primary">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{thread.customer.firstName ?? "Cliente"}</p>
                    <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
                      {thread._count.messages} nuevos
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{thread.subject}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
