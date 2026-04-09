import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConvertQuoteButton } from "@/features/quotes/components/convert-quote-button";

export const dynamic = "force-dynamic";

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      convertedOrder: true,
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Cotizacion {quote.quoteNumber}</h1>
          <p className="mt-2 text-slate-300">
            {quote.customer
              ? `Cliente: ${[quote.customer.firstName, quote.customer.lastName].filter(Boolean).join(" ")}`
              : "Cotizacion sin cliente asociado"}
          </p>
        </div>
        <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">{quote.status}</Badge>
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
                  {quote.items.map((item) => (
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

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Estado y aprobacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <span className="font-medium text-white">{quote.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vigencia</span>
                <span className="font-medium text-white">
                  {quote.validUntil ? quote.validUntil.toLocaleDateString("es-MX") : "Sin fecha"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-medium text-white">{formatCurrency(Number(quote.grandTotal))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Anticipo</span>
                <span className="font-medium text-white">{formatCurrency(Number(quote.depositRequired))}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>Siguientes acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              {quote.convertedOrder ? (
                <>
                  <p>Esta cotizacion ya fue convertida a pedido.</p>
                  <Link href={`/admin/orders/${quote.convertedOrder.id}`} className="font-medium text-cyan-300">
                    Abrir pedido {quote.convertedOrder.orderNumber}
                  </Link>
                </>
              ) : (
                <ConvertQuoteButton quoteId={quote.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
