import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { CreateCheckoutButton } from "@/features/payments/components/create-checkout-button";

export const dynamic = "force-dynamic";

export default async function PortalPaymentsPage() {
  const session = await requireCustomerSession();

  const orders = session?.user.customerId
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
      <div>
        <h1 className="text-4xl">Pagos</h1>
        <p className="mt-2 text-slate-600">Aqui puedes cubrir tu anticipo, liquidar tu saldo y revisar el historial de transacciones de cada viaje.</p>
      </div>
      <div className="grid gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="rounded-[2rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{order.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Saldo pendiente</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {formatCurrency(Number(order.balanceDue))}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {order.paymentSchedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-[1.5rem] bg-slate-50 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-950">{schedule.dueType}</span>
                      <span className="font-medium text-slate-950">{formatCurrency(Number(schedule.amount))}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {schedule.status} · vence {schedule.dueDate.toLocaleDateString("es-MX")}
                    </p>
                    {schedule.status === "PENDING" ? (
                      <div className="mt-4">
                        <CreateCheckoutButton
                          orderId={order.id}
                          scheduleId={schedule.id}
                          audience="client"
                          label={`Pagar ${schedule.dueType.toLowerCase()}`}
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                {order.payments.length > 0 ? (
                  order.payments.map((payment) => (
                    <div key={payment.id} className="rounded-[1.5rem] border border-slate-200 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-slate-950">{payment.provider}</span>
                        <span className="font-medium text-slate-950">{formatCurrency(Number(payment.amount))}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {payment.status} · {payment.paidAt ? payment.paidAt.toLocaleDateString("es-MX") : "pendiente"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                    Aun no hay pagos registrados para este pedido.
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Aun no hay pagos o calendarios de cobro visibles para tu cuenta.
          </div>
        )}
      </div>
    </div>
  );
}
