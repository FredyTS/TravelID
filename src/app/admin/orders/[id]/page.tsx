import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      paymentSchedules: true,
      payments: true,
      travelUpdates: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Pedido {order.orderNumber}</h1>
          <p className="mt-2 text-slate-300">
            {order.customer
              ? `Cliente: ${[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ")}`
              : "Pedido sin cliente"}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-cyan-300 text-slate-950 hover:bg-cyan-300">{order.status}</Badge>
          <Badge className="bg-white/10 text-white hover:bg-white/10">{order.fulfillmentStatus}</Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Resumen de conceptos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-slate-300">Concepto</TableHead>
                      <TableHead className="text-slate-300">Cant.</TableHead>
                      <TableHead className="text-slate-300">Unitario</TableHead>
                      <TableHead className="text-slate-300">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id} className="border-white/10">
                        <TableCell className="text-slate-100">{item.title}</TableCell>
                        <TableCell className="text-slate-100">{item.quantity}</TableCell>
                        <TableCell className="text-slate-100">{formatCurrency(Number(item.unitPrice))}</TableCell>
                        <TableCell className="text-slate-100">{formatCurrency(Number(item.lineTotal))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Timeline del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.travelUpdates.length > 0 ? (
                order.travelUpdates.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="font-medium text-white">{entry.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{entry.message}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Aun no hay actualizaciones publicadas para este pedido.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Estado financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Total del pedido</span>
                <span className="font-medium text-white">{formatCurrency(Number(order.grandTotal))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pagado</span>
                <span className="font-medium text-white">{formatCurrency(Number(order.paidTotal))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saldo pendiente</span>
                <span className="font-medium text-white">{formatCurrency(Number(order.balanceDue))}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Calendario de cobro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              {order.paymentSchedules.map((schedule) => (
                <div key={schedule.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span>{schedule.dueType}</span>
                    <span className="font-medium text-white">
                      {formatCurrency(Number(schedule.amount))}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Vence: {schedule.dueDate.toLocaleDateString("es-MX")} · {schedule.status}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
