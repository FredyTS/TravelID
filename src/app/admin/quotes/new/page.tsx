import { quoteBuilderSections, quoteLineItems } from "@/lib/constants/mock-data";
import { AdminQuoteForm } from "@/features/quotes/components/admin-quote-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function NewQuotePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Nueva cotizacion</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Flujo base para crear una propuesta desde catalogo o de forma manual y convertirla despues en pedido.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10">
            Guardar borrador
          </Button>
          <Button>Enviar propuesta</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Resumen comercial</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminQuoteForm />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Conceptos de la propuesta</CardTitle>
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
              <Button className="mt-4" variant="outline">
                Agregar concepto
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Notas visibles al cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                defaultValue="Incluye asistencia previa al viaje, condiciones del anticipo y tiempos estimados de entrega de documentos."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Checklist de armado</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {quoteBuilderSections.map((section, index) => (
                <div key={section.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg text-white">{section.title}</h3>
                    <Badge className="bg-white/10 text-white hover:bg-white/10">Paso {index + 1}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{section.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Resumen financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Subtotal</span>
                <span>$11,040 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Descuento</span>
                <span>-$1,050 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total</span>
                <span className="text-xl font-semibold">$9,990 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Anticipo sugerido</span>
                <span>$3,500 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Vigencia</span>
                <span>72 horas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
