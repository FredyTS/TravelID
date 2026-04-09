import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      quote: {
        select: {
          quoteNumber: true,
        },
      },
      order: {
        select: {
          orderNumber: true,
        },
      },
    },
    take: 50,
  });

  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Documentos</h1>
      <p className="text-slate-600">Centro de carga y consulta de vouchers, itinerarios, comprobantes y adjuntos.</p>
      <div className="grid gap-3">
        {documents.length > 0 ? (
          documents.map((document) => (
            <div key={document.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{document.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {document.type} · {document.visibility}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {document.quote?.quoteNumber ? `Cotizacion ${document.quote.quoteNumber}` : null}
                    {document.quote?.quoteNumber && document.order?.orderNumber ? " · " : null}
                    {document.order?.orderNumber ? `Pedido ${document.order.orderNumber}` : null}
                  </p>
                  {document.customer ? (
                    <p className="mt-1 text-xs text-slate-400">
                      {[document.customer.firstName, document.customer.lastName].filter(Boolean).join(" ") || document.customer.email}
                    </p>
                  ) : null}
                </div>
                <Link href={`/api/documents/${document.id}/download`} className="text-sm font-medium text-primary">
                  Descargar
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
            Todavia no hay documentos registrados.
          </div>
        )}
      </div>
    </div>
  );
}
