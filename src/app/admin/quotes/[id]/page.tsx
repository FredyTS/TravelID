import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConvertQuoteButton } from "@/features/quotes/components/convert-quote-button";
import { RegisterQuoteProposalButton } from "@/features/documents/components/register-quote-proposal-button";

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
      documents: true,
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-slate-950">Cotizacion {quote.quoteNumber}</h1>
          <p className="mt-2 text-slate-600">
            {quote.customer
              ? `Cliente: ${[quote.customer.firstName, quote.customer.lastName].filter(Boolean).join(" ")}`
              : "Cotizacion sin cliente asociado"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {quote.proposalHtml ? (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/api/quotes/${quote.id}/proposal`}
                target="_blank"
                className="text-sm font-medium text-primary hover:underline"
              >
                Abrir propuesta HTML
              </Link>
              <Link
                href={`/api/quotes/${quote.id}/proposal-pdf`}
                target="_blank"
                className="text-sm font-medium text-primary hover:underline"
              >
                Abrir propuesta PDF
              </Link>
            </div>
          ) : null}
          <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">{quote.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Desglose comercial</CardTitle>
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
                  {quote.items.map((item) => (
                    <TableRow key={item.id} className="border-slate-200">
                      <TableCell className="text-slate-700">{item.title}</TableCell>
                      <TableCell className="text-slate-700">{item.quantity}</TableCell>
                      <TableCell className="text-slate-700">{formatCurrency(Number(item.unitPrice))}</TableCell>
                      <TableCell className="text-slate-700">{formatCurrency(Number(item.lineTotal))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Estado y aprobacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <span className="font-medium text-slate-950">{quote.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vista en portal</span>
                <span className="font-medium text-slate-950">
                  {quote.viewedAt ? quote.viewedAt.toLocaleDateString("es-MX") : "Pendiente"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Aprobada por cliente</span>
                <span className="font-medium text-slate-950">
                  {quote.approvedAt ? quote.approvedAt.toLocaleDateString("es-MX") : "Pendiente"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vigencia</span>
                <span className="font-medium text-slate-950">
                  {quote.validUntil ? quote.validUntil.toLocaleDateString("es-MX") : "Sin fecha"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="font-medium text-slate-950">{formatCurrency(Number(quote.grandTotal))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Anticipo</span>
                <span className="font-medium text-slate-950">{formatCurrency(Number(quote.depositRequired))}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Siguientes acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {quote.convertedOrder ? (
                <>
                  <p>Esta cotizacion ya fue convertida a pedido.</p>
                  <Link href={`/admin/orders/${quote.convertedOrder.id}`} className="font-medium text-primary">
                    Abrir pedido {quote.convertedOrder.orderNumber}
                  </Link>
                </>
              ) : (
                <ConvertQuoteButton quoteId={quote.id} />
              )}
              {quote.proposalHtml ? (
                <div className="space-y-3">
                  <Link href={`/api/quotes/${quote.id}/proposal`} target="_blank" className="block font-medium text-primary">
                    Vista imprimible de la cotizacion
                  </Link>
                  <Link href={`/api/quotes/${quote.id}/proposal-pdf`} target="_blank" className="block font-medium text-primary">
                    Descargar o abrir PDF
                  </Link>
                  <RegisterQuoteProposalButton quoteId={quote.id} />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Documentos publicados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {quote.documents.length > 0 ? (
                quote.documents.map((document) => (
                  <div key={document.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <p className="font-medium text-slate-950">{document.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {document.type} · {document.visibility}
                    </p>
                    <Link href={`/api/documents/${document.id}/download`} className="mt-3 inline-block font-medium text-primary">
                      Descargar documento
                    </Link>
                  </div>
                ))
              ) : (
                <p>Aun no hay documentos publicados para esta cotizacion.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
