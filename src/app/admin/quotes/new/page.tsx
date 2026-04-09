import { quoteBuilderSections, quoteLineItems } from "@/lib/constants/mock-data";
import { AdminQuoteForm } from "@/features/quotes/components/admin-quote-form";
import { getPackageOptions } from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function NewQuotePage() {
  const packageOptions = await getPackageOptions();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-slate-950">Nueva cotizacion</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Crea una propuesta comercial completa con hotel, vuelos, traslados, condiciones y notas para el cliente.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Guardar borrador
          </Button>
          <Button>Enviar propuesta</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Resumen comercial</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminQuoteForm
                packageOptions={packageOptions.map((pkg) => ({
                  slug: pkg.slug,
                  name: pkg.name,
                  destination: pkg.destination.name,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Conceptos de la propuesta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-500">Concepto</TableHead>
                      <TableHead className="text-slate-500">Cant.</TableHead>
                      <TableHead className="text-slate-500">Unitario</TableHead>
                      <TableHead className="text-slate-500">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteLineItems.map((item) => (
                      <TableRow key={item[0]} className="border-slate-200">
                        {item.map((cell) => (
                          <TableCell key={cell} className="text-slate-700">
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

          <Card className="rounded-[2rem] border-slate-200 bg-white">
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
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Checklist de armado</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {quoteBuilderSections.map((section, index) => (
                <div key={section.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg text-slate-950">{section.title}</h3>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Paso {index + 1}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{section.description}</p>
                </div>
              ))}
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Usa los bloques JSON para capturar la informacion que debe salir en la plantilla final del cliente. Esta propuesta queda guardada en la cotizacion.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Resumen financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>$11,040 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Descuento</span>
                <span>-$1,050 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total</span>
                <span className="text-xl font-semibold">$9,990 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Anticipo sugerido</span>
                <span>$3,500 MXN</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vigencia</span>
                <span>72 horas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
