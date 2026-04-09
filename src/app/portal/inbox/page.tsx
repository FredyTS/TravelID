import Link from "next/link";
import { requireCustomerSession } from "@/lib/auth/guards";
import { ensureConversationThread, listThreadsForCustomer } from "@/features/communications/server/communications-service";
import { Badge } from "@/components/ui/badge";
import { MessageComposer } from "@/features/communications/components/message-composer";

export const dynamic = "force-dynamic";

export default async function PortalInboxPage() {
  const session = await requireCustomerSession();

  if (!session?.user.customerId) {
    return null;
  }

  await ensureConversationThread({
    customerId: session.user.customerId,
    subject: "Consulta general",
  });

  const threads = await listThreadsForCustomer(session.user.customerId);
  const generalThread = threads[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="surface p-8 text-slate-900">
        <h1 className="text-4xl">Inbox</h1>
        <p className="mt-2 text-slate-600">Escribe tus dudas y da seguimiento a cada viaje desde un solo lugar.</p>
        <div className="mt-6 grid gap-3">
          {threads.map((thread) => (
            <Link key={thread.id} href={`/portal/inbox/${thread.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 hover:border-primary">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-950">{thread.subject}</p>
                {thread._count.messages > 0 ? (
                  <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
                    {thread._count.messages} nuevos
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {thread.order?.orderNumber ?? thread.quote?.quoteNumber ?? "Consulta general"}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <div className="surface p-8 text-slate-900">
        <h2 className="text-3xl">Nueva duda</h2>
        <p className="mt-2 text-slate-600">Si necesitas ayuda con pagos, documentos o una futura reserva, escribenos aqui.</p>
        <div className="mt-6">
          <MessageComposer
            endpoint="/api/portal/messages"
            payload={{ threadId: generalThread?.id, subject: "Consulta general" }}
            placeholder="Cuéntanos en qué te podemos ayudar."
            buttonLabel="Enviar al admin"
          />
        </div>
      </div>
    </div>
  );
}
