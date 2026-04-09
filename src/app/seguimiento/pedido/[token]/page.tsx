import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SharedOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const order = await prisma.order.findFirst({
    where: { shareToken: token },
    include: {
      customer: true,
      items: {
        orderBy: { sortOrder: "asc" },
      },
      paymentSchedules: {
        orderBy: { dueDate: "asc" },
      },
      travelUpdates: {
        where: { visibility: "CLIENT" },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        where: { visibility: "CLIENT" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="surface p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Seguimiento compartido</p>
          <h1 className="mt-3 text-4xl text-slate-950">{order.title}</h1>
          <p className="mt-2 text-slate-600">
            {order.orderNumber} · {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Estado</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{order.status}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.grandTotal))}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pagado</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.paidTotal))}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Saldo</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.balanceDue))}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h2 className="text-2xl text-slate-950">Servicios del viaje</h2>
              <div className="mt-5 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{item.title}</p>
                      <span className="font-medium text-slate-950">{formatCurrency(Number(item.lineTotal))}</span>
                    </div>
                    {item.description ? <p className="mt-2 text-sm text-slate-500">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h2 className="text-2xl text-slate-950">Actualizaciones</h2>
              <div className="mt-5 space-y-3">
                {order.travelUpdates.length > 0 ? (
                  order.travelUpdates.map((update) => (
                    <div key={update.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                      <p className="font-medium text-slate-950">{update.title}</p>
                      <p className="mt-2 text-sm text-slate-600">{update.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Aún no hay actualizaciones publicadas.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h2 className="text-xl text-slate-950">Próximos pagos</h2>
              <div className="mt-4 space-y-3">
                {order.paymentSchedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-[1.25rem] border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-950">{schedule.dueType}</span>
                      <span className="font-medium text-slate-950">{formatCurrency(Number(schedule.amount))}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {schedule.status} · {schedule.dueDate.toLocaleDateString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h2 className="text-xl text-slate-950">Portal completo</h2>
              <p className="mt-3 text-sm text-slate-600">
                Para pagar, descargar documentos o mandar mensajes, entra al portal con el correo del titular.
              </p>
              <Link href="/login" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                Ir al portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
