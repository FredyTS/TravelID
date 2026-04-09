import { quoteLineItems } from "@/lib/constants/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Cotizacion {id}</h1>
          <p className="mt-2 text-slate-300">
            Vista preparada para revisar la propuesta, ajustar importes y convertirla a pedido.
          </p>
        </div>
        <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">SENT</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5 text-white shadow-none">
          <CardHeader>
            <CardTitle>Desglose comercial</CardTitle>
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

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Estado y aprobacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <span className="font-medium text-white">Enviada</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vigencia</span>
                <span className="font-medium text-white">12 ago 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-medium text-white">$9,990 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Anticipo</span>
                <span className="font-medium text-white">$3,500 MXN</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Siguientes acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <p>Confirmar si el cliente requiere cambios de fecha o de hotel.</p>
              <p>Enviar recordatorio de vigencia y opcion de pago.</p>
              <p>Convertir a pedido al aprobarse y generar schedule de cobro.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
