import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PortalTripsPage() {
  const session = await requireCustomerSession();

  const orders = session?.user.customerId
    ? await prisma.order.findMany({
        where: {
          customerId: session.user.customerId,
          portalEnabled: true,
        },
        orderBy: [{ departureDate: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Mis viajes</h1>
          <p className="mt-2 text-slate-600">Aqui veras tus reservaciones activas, su estatus y el saldo pendiente de cada una.</p>
        </div>
      </div>
      <div className="grid gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/portal/viajes/${order.id}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 transition hover:border-primary hover:shadow-lg hover:shadow-slate-200/80"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-semibold text-slate-950">{order.title}</p>
                    <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {order.departureDate
                      ? `Salida: ${order.departureDate.toLocaleDateString("es-MX")}`
                      : "Fecha de salida por confirmar"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Saldo pendiente</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {formatCurrency(Number(order.balanceDue))}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Todavia no hay viajes visibles en tu portal.
          </div>
        )}
      </div>
    </div>
  );
}
