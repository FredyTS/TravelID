import { redirect } from "next/navigation";
import { requireCustomerSession } from "@/lib/auth/guards";
import { getCustomerThread } from "@/features/communications/server/communications-service";
import { MessageComposer } from "@/features/communications/components/message-composer";

export const dynamic = "force-dynamic";

export default async function PortalThreadDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const session = await requireCustomerSession();
  const { threadId } = await params;

  if (!session?.user.customerId) {
    redirect(`/acceso?next=${encodeURIComponent(`/portal/inbox/${threadId}`)}`);
  }

  const thread = await getCustomerThread(threadId, session.user.customerId);

  if (!thread) {
    redirect("/portal/inbox");
  }

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div>
        <h1 className="text-4xl">{thread.subject}</h1>
        <p className="mt-2 text-slate-600">
          {thread.order?.orderNumber ?? thread.quote?.quoteNumber ?? "Conversacion general"}
        </p>
      </div>

      <div className="space-y-3">
        {thread.messages.length > 0 ? (
          thread.messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[92%] rounded-[1.5rem] px-4 py-3 text-sm ${
                message.senderRole === "CLIENT"
                  ? "ml-auto bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <p>{message.body}</p>
              <p className={`mt-2 text-xs ${message.senderRole === "CLIENT" ? "text-white/70" : "text-slate-500"}`}>
                {message.createdAt.toLocaleString("es-MX")}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">Todavia no hay mensajes en esta conversacion.</p>
        )}
      </div>

      <MessageComposer
        endpoint="/api/portal/messages"
        payload={{ threadId: thread.id }}
        placeholder="Escribe tu siguiente mensaje."
        buttonLabel="Responder"
      />
    </div>
  );
}
