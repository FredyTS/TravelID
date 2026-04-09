import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      order: true,
    },
  });

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div>
        <h1 className="text-4xl">Pagos</h1>
        <p className="mt-2 text-slate-600">Consolidado de Mercado Pago, pagos manuales, saldos y conciliacion basica.</p>
      </div>
      <div className="grid gap-3">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <Link key={payment.id} href={`/admin/orders/${payment.orderId}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 hover:border-primary">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-950">{payment.order.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{payment.order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-950">{formatCurrency(Number(payment.amount))}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                    <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{payment.provider}</Badge>
                    <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{payment.status}</Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Todavia no hay pagos registrados.
          </div>
        )}
      </div>
    </div>
  );
}
