import Link from "next/link";
import { listThreadsForAdmin } from "@/features/communications/server/communications-service";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminConversationsPage() {
  const threads = await listThreadsForAdmin();

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div>
        <h1 className="text-4xl">Conversaciones</h1>
        <p className="mt-2 text-slate-600">Inbox central para dudas, seguimiento y respuestas directas a cada cliente.</p>
      </div>
      <div className="grid gap-3">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <Link key={thread.id} href={`/admin/conversations/${thread.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 hover:border-primary">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium text-slate-950">
                      {[thread.customer.firstName, thread.customer.lastName].filter(Boolean).join(" ") || "Cliente"}
                    </p>
                    {thread._count.messages > 0 ? (
                      <Badge className="rounded-full bg-sky-100 text-sky-800 hover:bg-sky-100">
                        {thread._count.messages} nuevos
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{thread.subject}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{thread.order?.orderNumber ?? thread.quote?.quoteNumber ?? "General"}</p>
                  <p className="mt-1">
                    {thread.lastMessageAt
                      ? thread.lastMessageAt.toLocaleString("es-MX")
                      : thread.updatedAt.toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Todavia no hay conversaciones abiertas.
          </div>
        )}
      </div>
    </div>
  );
}
