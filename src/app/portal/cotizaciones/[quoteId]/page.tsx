import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { canAccessCustomerResource } from "@/lib/permissions/policies";
import { formatCurrency } from "@/lib/utils";
import { ApproveQuoteButton } from "@/features/quotes/components/approve-quote-button";
import { QuoteFeedbackForm } from "@/features/quotes/components/quote-feedback-form";
import { markQuoteViewed } from "@/features/orders/server/sales-service";

export const dynamic = "force-dynamic";

export default async function PortalQuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const session = await requireCustomerSession();
  const { quoteId } = await params;

  if (!session?.user.customerId) {
    notFound();
  }

  const existingQuote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      items: {
        orderBy: { sortOrder: "asc" },
      },
      documents: {
        where: { visibility: "CLIENT" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!existingQuote || !canAccessCustomerResource(session.user.customerId, existingQuote.customerId)) {
    notFound();
  }

  await markQuoteViewed({
    quoteId,
    customerId: session.user.customerId,
  });

  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: {
      customer: true,
      convertedOrder: true,
      items: {
        orderBy: { sortOrder: "asc" },
      },
      documents: {
        where: { visibility: "CLIENT" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const canApprove = ["DRAFT", "SENT", "VIEWED", "APPROVED"].includes(quote.status);
  const isExpired = quote.status === "EXPIRED";

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div>
        <h1 className="text-4xl">Cotizacion privada</h1>
        <p className="mt-2 text-slate-600">{quote.quoteNumber} · {quote.status}</p>
      </div>
      {quote.proposalHtml ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-950">Tu propuesta detallada ya esta lista</p>
              <p className="mt-1 text-sm text-slate-600">
                Incluye hoteles, vuelos, traslados, condiciones y notas visibles.
              </p>
            </div>
            <Link href={`/api/quotes/${quote.id}/proposal`} target="_blank" className="text-sm font-medium text-primary hover:underline">
              Abrir propuesta completa
            </Link>
            <Link href={`/api/quotes/${quote.id}/proposal-pdf`} target="_blank" className="text-sm font-medium text-primary hover:underline">
              Abrir PDF
            </Link>
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(quote.grandTotal))}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="text-slate-500">Anticipo</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(quote.depositRequired))}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="text-slate-500">Saldo</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(quote.balanceDue))}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="text-slate-500">Vigencia</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            {quote.validUntil ? quote.validUntil.toLocaleDateString("es-MX") : "Sin fecha"}
          </p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          {quote.convertedOrder ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-900">Tu cotizacion ya fue aprobada</p>
              <p className="mt-2 text-sm text-emerald-800">
                Tu viaje ya esta en seguimiento y el pago se gestiona desde el pedido generado.
              </p>
              <Link href={`/portal/viajes/${quote.convertedOrder.id}`} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                Abrir seguimiento del viaje
              </Link>
            </div>
          ) : isExpired ? (
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">La vigencia de esta cotizacion ya vencio</p>
              <p className="mt-2 text-sm text-amber-800">
                Escríbenos desde el portal o por WhatsApp para actualizar montos y disponibilidad.
              </p>
            </div>
          ) : canApprove ? (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-slate-950">¿Te gusta esta propuesta?</p>
                <p className="mt-2 text-sm text-slate-600">
                  Al aprobarla generaremos tu pedido y desde ahi podras pagar anticipo, revisar estatus y descargar documentos.
                </p>
                <div className="mt-4 max-w-sm">
                  <ApproveQuoteButton quoteId={quote.id} />
                </div>
              </div>
              <QuoteFeedbackForm quoteId={quote.id} />
            </div>
          ) : null}

          <div className="grid gap-3">
            {quote.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <span className="font-medium text-slate-950">{formatCurrency(Number(item.lineTotal))}</span>
                </div>
                {item.description ? <p className="mt-2 text-sm text-slate-500">{item.description}</p> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-950">Estado de la propuesta</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Estado actual</span>
                <span className="font-medium text-slate-950">{quote.status}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Vista en portal</span>
                <span className="font-medium text-slate-950">
                  {quote.viewedAt ? quote.viewedAt.toLocaleDateString("es-MX") : "Pendiente"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Aprobacion</span>
                <span className="font-medium text-slate-950">
                  {quote.approvedAt ? quote.approvedAt.toLocaleDateString("es-MX") : "Pendiente"}
                </span>
              </div>
            </div>
          </div>
          {quote.documents.length > 0 ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-950">Documentos publicados</p>
              <div className="mt-3 grid gap-3">
                {quote.documents.map((document) => (
                  <Link
                    key={document.id}
                    href={`/api/documents/${document.id}/download`}
                    className="rounded-[1rem] border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    {document.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
