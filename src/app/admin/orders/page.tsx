import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { PlaceholderTable } from "@/components/shared/placeholder-table";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      customer: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-slate-950">Pedidos</h1>
          <p className="mt-2 text-slate-600">
            Seguimiento central de reservas confirmadas, pagos, documentos y entrega final.
          </p>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "Cliente"}
                  </td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(order.balanceDue))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PlaceholderTable
          columns={["Pedido", "Cliente", "Estado", "Saldo"]}
          rows={[["Sin pedidos", "Aun no hay reservas registradas", "-", "-"]]}
        />
      )}
    </div>
  );
}
