import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const session = await requireCustomerSession();

  const [documents, quotes] = session?.user.customerId
    ? await Promise.all([
        prisma.document.findMany({
          where: {
            visibility: "CLIENT",
            OR: [
              { customerId: session.user.customerId },
              { order: { customerId: session.user.customerId } },
              { quote: { customerId: session.user.customerId } },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.quote.findMany({
          where: {
            customerId: session.user.customerId,
            visibility: "AUTH_PORTAL",
            proposalData: {
              not: null,
            },
          },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            quoteNumber: true,
            updatedAt: true,
          },
        }),
      ])
    : [[], []];

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div>
        <h1 className="text-4xl">Documentos</h1>
        <p className="mt-2 text-slate-600">
          Aqui encontraras vouchers, itinerarios, recibos y tambien las propuestas de cotizacion disponibles.
        </p>
      </div>

      <div className="grid gap-3">
        {quotes.map((quote) => (
          <div key={`quote-proposal-${quote.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="font-medium text-slate-950">Propuesta de cotizacion · {quote.quoteNumber}</p>
            <p className="mt-1 text-sm text-slate-500">{quote.title}</p>
            <p className="mt-3 text-xs text-slate-400">
              Generada o actualizada el {quote.updatedAt.toLocaleDateString("es-MX")}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
              <Link href={`/api/quotes/${quote.id}/proposal-pdf`} className="text-primary">
                Abrir PDF
              </Link>
              <Link href={`/api/quotes/${quote.id}/proposal`} className="text-primary">
                Abrir propuesta web
              </Link>
            </div>
          </div>
        ))}

        {documents.length > 0 ? (
          documents.map((document) => (
            <div key={document.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <p className="font-medium text-slate-950">{document.name}</p>
              <p className="mt-1 text-sm text-slate-500">{document.type}</p>
              <p className="mt-3 text-xs text-slate-400">
                Carga publicada el {document.createdAt.toLocaleDateString("es-MX")}
              </p>
              <Link href={`/api/documents/${document.id}/download`} className="mt-4 inline-block text-sm font-medium text-primary">
                Descargar documento
              </Link>
            </div>
          ))
        ) : quotes.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Todavia no hay documentos visibles para tu cuenta.
          </div>
        ) : null}
      </div>
    </div>
  );
}
