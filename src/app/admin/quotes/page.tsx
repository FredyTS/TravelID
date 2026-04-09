import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { PlaceholderTable } from "@/components/shared/placeholder-table";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      customer: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Cotizaciones</h1>
          <p className="mt-2 text-slate-300">Propuestas guardadas en la base y listas para convertirse en pedido.</p>
        </div>
        <Link href="/admin/quotes/new" className="text-sm font-medium text-cyan-300">
          Nueva cotizacion
        </Link>
      </div>

      {quotes.length > 0 ? (
        <div className="surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Quote</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/quotes/${quote.id}`} className="font-medium text-primary">
                      {quote.quoteNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {quote.customer
                      ? [quote.customer.firstName, quote.customer.lastName].filter(Boolean).join(" ")
                      : "Sin cliente"}
                  </td>
                  <td className="px-4 py-3">{quote.status}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(quote.grandTotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PlaceholderTable
          columns={["Quote", "Cliente", "Estado", "Total"]}
          rows={[["Sin registros", "Crea tu primera cotizacion", "-", "-"]]}
        />
      )}
    </div>
  );
}
