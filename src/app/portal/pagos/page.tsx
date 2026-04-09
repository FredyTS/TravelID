import { getServerAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortalPaymentsPage() {
  const session = await getServerAuthSession();

  const orders = session?.user?.customerId
    ? await prisma.order.findMany({
        where: { customerId: session.user.customerId },
        orderBy: { createdAt: "desc" },
        include: {
          paymentSchedules: {
            orderBy: { dueDate: "asc" },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : [];

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <h1 className="text-4xl">Pagos</h1>
      <p className="text-slate-600">Resumen de anticipo, saldo pendiente e historial de transacciones del viaje.</p>
      <div className="grid gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="rounded-3xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">{order.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.orderNumber}</p>
                </div>
                <p className="text-sm font-medium text-primary">
                  Saldo: {formatCurrency(Number(order.balanceDue))}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {order.paymentSchedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>{schedule.dueType}</span>
                      <span>{formatCurrency(Number(schedule.amount))}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {schedule.status} · vence {schedule.dueDate.toLocaleDateString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>{payment.provider}</span>
                      <span>{formatCurrency(Number(payment.amount))}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {payment.status} ·{" "}
                      {payment.paidAt ? payment.paidAt.toLocaleDateString("es-MX") : "pendiente"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border p-5 text-sm text-slate-600">
            Aún no hay pagos o calendarios de cobro visibles para tu cuenta.
          </div>
        )}
      </div>
    </div>
  );
}
