import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SharedQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const quote = await prisma.quote.findFirst({
    where: { shareToken: token },
    include: {
      customer: true,
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="surface p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Cotización compartida</p>
          <h1 className="mt-3 text-4xl text-slate-950">{quote.title}</h1>
          <p className="mt-2 text-slate-600">
            {quote.quoteNumber} · Cliente: {[quote.customer?.firstName, quote.customer?.lastName].filter(Boolean).join(" ") || "Por confirmar"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(quote.grandTotal))}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Anticipo</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(quote.depositRequired))}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Saldo</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(quote.balanceDue))}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Vigencia</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {quote.validUntil ? quote.validUntil.toLocaleDateString("es-MX") : "Sin fecha"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h2 className="text-2xl text-slate-950">Desglose de la propuesta</h2>
            <div className="mt-5 space-y-3">
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
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h2 className="text-xl text-slate-950">Abrir propuesta completa</h2>
              <div className="mt-4 space-y-3">
                <Link href={`/api/share/quotes/${quote.shareToken}/proposal`} target="_blank" className="block text-sm font-medium text-primary hover:underline">
                  Abrir propuesta HTML
                </Link>
                <Link href={`/api/share/quotes/${quote.shareToken}/proposal-pdf`} target="_blank" className="block text-sm font-medium text-primary hover:underline">
                  Abrir propuesta PDF
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h2 className="text-xl text-slate-950">Siguiente paso</h2>
              <p className="mt-3 text-sm text-slate-600">
                Para aprobar, pagar o mandar mensajes directos, entra al portal con el correo del cliente.
              </p>
              <Link href="/acceso" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                Ir al portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
