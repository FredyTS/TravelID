import { orderTimeline, quoteLineItems } from "@/lib/constants/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Pedido {id}</h1>
          <p className="mt-2 text-slate-300">
            Vista operativa para controlar cobros, documentos y avance de la reserva.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-cyan-300 text-slate-950 hover:bg-cyan-300">PARTIALLY_PAID</Badge>
          <Badge className="bg-white/10 text-white hover:bg-white/10">BOOKING_IN_PROGRESS</Badge>
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
                    {quoteLineItems.map((item) => (
                      <TableRow key={item[0]} className="border-white/10">
                        {item.map((cell) => (
                          <TableCell key={cell} className="text-slate-100">
                            {cell}
                          </TableCell>
                        ))}
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
              {orderTimeline.map((entry) => (
                <div key={entry.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <h3 className="font-medium text-white">{entry.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
                </div>
              ))}
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
                <span className="font-medium text-white">$9,990 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pagado</span>
                <span className="font-medium text-white">$3,500 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saldo pendiente</span>
                <span className="font-medium text-white">$6,490 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Proximo vencimiento</span>
                <span className="font-medium text-white">22 ago 2026</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Operacion pendiente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Confirmar booking del hotel y cargar voucher final.</p>
              <p>Enviar recordatorio de saldo al cliente.</p>
              <p>Publicar actualizacion de viaje cuando se complete la documentacion.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
