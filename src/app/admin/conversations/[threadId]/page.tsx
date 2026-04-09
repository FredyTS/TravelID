import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth/session";
import { getAdminThread } from "@/features/communications/server/communications-service";
import { MessageComposer } from "@/features/communications/components/message-composer";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const session = await getServerAuthSession();
  const { threadId } = await params;

  if (!session?.user.id) {
    notFound();
  }

  const thread = await getAdminThread(threadId);

  if (!thread) {
    notFound();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="surface p-8 text-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl">{thread.subject}</h1>
          <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{thread.threadType}</Badge>
        </div>
        <div className="mt-5 grid gap-4 text-sm text-slate-600">
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-slate-500">Cliente</p>
            <p className="mt-1 font-medium text-slate-950">
              {[thread.customer.firstName, thread.customer.lastName].filter(Boolean).join(" ") || "Cliente"}
            </p>
            <p className="mt-1">{thread.customer.email ?? "Sin email"}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-slate-500">Contexto</p>
            <p className="mt-1 font-medium text-slate-950">
              {thread.order?.orderNumber ?? thread.quote?.quoteNumber ?? "Consulta general"}
            </p>
          </div>
        </div>
      </div>
      <div className="surface space-y-5 p-8 text-slate-900">
        <div className="space-y-3">
          {thread.messages.length > 0 ? (
            thread.messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-[1.5rem] px-4 py-3 text-sm ${
                  message.senderRole === "ADMIN"
                    ? "ml-auto bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <p>{message.body}</p>
                <p className={`mt-2 text-xs ${message.senderRole === "ADMIN" ? "text-white/70" : "text-slate-500"}`}>
                  {message.createdAt.toLocaleString("es-MX")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">Todavia no hay mensajes en esta conversacion.</p>
          )}
        </div>

        <MessageComposer
          endpoint="/api/admin/messages"
          payload={{ threadId: thread.id }}
          placeholder="Escribe una respuesta para el cliente."
          buttonLabel="Responder al cliente"
        />
      </div>
    </div>
  );
}
