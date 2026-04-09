import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      user: true,
      orders: {
        orderBy: { createdAt: "desc" },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
      },
      travelerProfiles: true,
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="surface p-8 text-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl">
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.companyName || "Cliente"}
            </h1>
            <p className="mt-2 text-slate-600">{customer.email ?? "Sin email registrado"}</p>
          </div>
          <div className="flex items-center gap-2">
            {customer.user ? (
              <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                Portal activo
              </Badge>
            ) : null}
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{customer.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface p-8 text-slate-900">
          <h2 className="text-2xl">Perfil y contacto</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">Telefono</p>
              <p className="mt-1 font-medium text-slate-950">{customer.phone ?? "Sin telefono"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">WhatsApp</p>
              <p className="mt-1 font-medium text-slate-950">{customer.whatsapp ?? "Sin dato"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">Notas</p>
              <p className="mt-1 text-slate-700">{customer.notes ?? "Sin notas internas."}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface p-8 text-slate-900">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl">Pedidos</h2>
            </div>
            <div className="mt-5 grid gap-3">
              {customer.orders.length > 0 ? (
                customer.orders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 hover:border-primary">
                    <p className="font-medium text-slate-950">{order.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{order.orderNumber}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-600">Aun no tiene pedidos registrados.</p>
              )}
            </div>
          </div>

          <div className="surface p-8 text-slate-900">
            <h2 className="text-2xl">Cotizaciones y viajeros</h2>
            <div className="mt-5 grid gap-3">
              {customer.quotes.map((quote) => (
                <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 hover:border-primary">
                  <p className="font-medium text-slate-950">{quote.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{quote.quoteNumber}</p>
                </Link>
              ))}
              {customer.travelerProfiles.map((traveler) => (
                <div key={traveler.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p className="font-medium text-slate-950">
                    {traveler.firstName} {traveler.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {traveler.nationality ?? "Sin nacionalidad"} · {traveler.passportNumber ?? "Sin pasaporte"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
