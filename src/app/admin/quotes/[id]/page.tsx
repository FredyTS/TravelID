import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConvertQuoteButton } from "@/features/quotes/components/convert-quote-button";
import { RegisterQuoteProposalButton } from "@/features/documents/components/register-quote-proposal-button";
import { ShareLinkPanel } from "@/features/sharing/components/share-link-panel";

export const dynamic = "force-dynamic";

function formatDate(value?: Date | null) {
  return value ? value.toLocaleDateString("es-MX") : "Pendiente";
}

function getMetadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value : null;
}

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          user: true,
        },
      },
      items: true,
      convertedOrder: true,
      documents: true,
    },
  });

  if (!quote) {
    notFound();
  }

  const latestShareLog = await prisma.activityLog.findFirst({
    where: {
      entityType: "QUOTE",
      entityId: quote.id,
      action: "QUOTE_LINK_SENT",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customerName =
    [quote.customer?.firstName, quote.customer?.lastName].filter(Boolean).join(" ") ||
    quote.customer?.companyName ||
    "Cotizacion sin cliente asociado";

  const preferredEmail =
    getMetadataString(latestShareLog?.metadata, "recipientEmail") ??
    quote.customer?.email ??
    quote.customer?.user?.email ??
    null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-slate-950">Cotizacion {quote.quoteNumber}</h1>
          <p className="mt-2 text-slate-600">{customerName}</p>
          {preferredEmail ? <p className="mt-1 text-sm text-slate-500">{preferredEmail}</p> : null}
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
              <CardTitle>Persona y entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-4 rounded-[1.5rem] bg-slate-50 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cliente</p>
                  <p className="mt-2 font-medium text-slate-950">{customerName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Correo principal</p>
                  <p className="mt-2 font-medium text-slate-950">{preferredEmail ?? "Sin correo"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Telefono</p>
                  <p className="mt-2 font-medium text-slate-950">{quote.customer?.phone ?? "Sin telefono"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">WhatsApp</p>
                  <p className="mt-2 font-medium text-slate-950">{quote.customer?.whatsapp ?? "Sin WhatsApp"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Usuario portal</p>
                  <p className="mt-2 font-medium text-slate-950">
                    {quote.customer?.user?.email ?? "Aun no vinculado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ultimo envio</p>
                  <p className="mt-2 font-medium text-slate-950">{formatDate(latestShareLog?.createdAt ?? quote.sentAt)}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-[1.5rem] border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ultimo destinatario del link</p>
                <p className="font-medium text-slate-950">{preferredEmail ?? "Todavia no se ha enviado un link"}</p>
                {getMetadataString(latestShareLog?.metadata, "shareUrl") ? (
                  <Link
                    href={getMetadataString(latestShareLog?.metadata, "shareUrl")!}
                    target="_blank"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Abrir ultimo link compartido
                  </Link>
                ) : null}
              </div>
            </CardContent>
          </Card>

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
                <span className="font-medium text-slate-950">{formatDate(quote.viewedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Aprobada por cliente</span>
                <span className="font-medium text-slate-950">{formatDate(quote.approvedAt)}</span>
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
              <CardTitle>Envio y seguimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <ShareLinkPanel
                endpoint={`/api/admin/quotes/${quote.id}/share`}
                defaultEmail={preferredEmail}
                shareLabel="Mandar link por correo"
                copyLabel="Copiar link manual"
              />
              <p>
                Puedes mandar este link al cliente para que revise la cotizacion, abra la propuesta y continue en su
                portal cuando lo necesite.
              </p>
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
