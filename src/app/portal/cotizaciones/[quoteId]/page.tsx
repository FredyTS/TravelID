import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { canAccessCustomerResource } from "@/lib/permissions/policies";
import { formatCurrency } from "@/lib/utils";

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

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!quote || !canAccessCustomerResource(session.user.customerId, quote.customerId)) {
    notFound();
  }

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
  );
}
