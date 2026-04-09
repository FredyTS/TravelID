import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PortalDocumentsPage() {
  const session = await requireCustomerSession();

  const documents = session?.user.customerId
    ? await prisma.document.findMany({
        where: {
          visibility: "CLIENT",
          OR: [{ customerId: session.user.customerId }, { order: { customerId: session.user.customerId } }],
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div>
        <h1 className="text-4xl">Documentos</h1>
        <p className="mt-2 text-slate-600">Aqui encontraras vouchers, itinerarios, recibos y archivos publicados para tu viaje.</p>
      </div>
      <div className="grid gap-3">
        {documents.length > 0 ? (
          documents.map((document) => (
            <div key={document.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <p className="font-medium text-slate-950">{document.name}</p>
              <p className="mt-1 text-sm text-slate-500">{document.type}</p>
              <p className="mt-3 text-xs text-slate-400">
                Carga publicada el {document.createdAt.toLocaleDateString("es-MX")}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Todavia no hay documentos visibles para tu cuenta.
          </div>
        )}
      </div>
    </div>
  );
}
