import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortalQuotesPage() {
  const session = await requireCustomerSession();

  const quotes = session?.user.customerId
    ? await prisma.quote.findMany({
        where: {
          customerId: session.user.customerId,
          visibility: "AUTH_PORTAL",
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        include: {
          convertedOrder: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
      })
    : [];

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Mis cotizaciones</h1>
          <p className="mt-2 text-slate-600">
            Revisa propuestas, abre el PDF, aprueba cambios y da seguimiento antes de convertir tu viaje en pedido.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {quotes.length > 0 ? (
          quotes.map((quote) => (
            <Link
              key={quote.id}
              href={`/portal/cotizaciones/${quote.id}`}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 transition hover:border-primary hover:shadow-lg hover:shadow-slate-200/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xl font-semibold text-slate-950">{quote.title}</p>
                    <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {quote.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{quote.quoteNumber}</p>
                  <p className="mt-3 text-sm text-slate-600">
                    {quote.validUntil
                      ? `Vigente hasta ${quote.validUntil.toLocaleDateString("es-MX")}`
                      : "Sin fecha de vigencia definida"}
                  </p>
                  {quote.convertedOrder ? (
                    <p className="mt-2 text-sm font-medium text-emerald-700">
                      Convertida a pedido {quote.convertedOrder.orderNumber}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-semibold text-slate-950">
                    {formatCurrency(Number(quote.grandTotal))}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Todavia no hay cotizaciones visibles en tu portal.
          </div>
        )}
      </div>
    </div>
  );
}
