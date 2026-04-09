import { notFound } from "next/navigation";
import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { canAccessCustomerResource } from "@/lib/permissions/policies";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCheckoutButton } from "@/features/payments/components/create-checkout-button";
import { MessageComposer } from "@/features/communications/components/message-composer";
import {
  ensureConversationThread,
  getCustomerThread,
} from "@/features/communications/server/communications-service";

export const dynamic = "force-dynamic";

export default async function PortalTripDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await requireCustomerSession();
  const { orderId } = await params;

  if (!session?.user.customerId) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: true,
      paymentSchedules: {
        orderBy: { dueDate: "asc" },
      },
      payments: {
        orderBy: { createdAt: "desc" },
      },
      travelUpdates: {
        where: { visibility: "CLIENT" },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        where: { visibility: "CLIENT" },
        orderBy: { createdAt: "desc" },
      },
      itinerary: true,
    },
  });

  if (!order || !canAccessCustomerResource(session.user.customerId, order.customerId)) {
    notFound();
  }

  const ensuredThread = await ensureConversationThread({
    customerId: session.user.customerId,
    orderId: order.id,
    subject: `Dudas sobre ${order.title}`,
  });
  const thread = await getCustomerThread(ensuredThread.id, session.user.customerId);
  const pendingSchedules = order.paymentSchedules.filter((schedule) => schedule.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Seguimiento del viaje</p>
            <h1 className="mt-3 text-4xl">{order.title}</h1>
            <p className="mt-2 text-slate-600">{order.orderNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{order.status}</Badge>
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{order.fulfillmentStatus}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Resumen del pedido</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-slate-500">Total</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.grandTotal))}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-slate-500">Pagado</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.paidTotal))}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-slate-500">Saldo</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.balanceDue))}</p>
                </div>
              </div>
              <div className="grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{item.title}</p>
                      <span className="font-medium text-slate-950">{formatCurrency(Number(item.lineTotal))}</span>
                    </div>
                    {item.description ? <p className="mt-2 text-sm text-slate-500">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Actualizaciones del viaje</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.travelUpdates.length > 0 ? (
                order.travelUpdates.map((update) => (
                  <div key={update.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <p className="font-medium text-slate-950">{update.title}</p>
                    <p className="mt-2 text-sm text-slate-600">{update.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Todavia no hay actualizaciones visibles para este viaje.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Mensajes con el admin</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {thread?.messages.length ? (
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
                  <p className="text-sm text-slate-600">Abre la conversación si tienes una duda sobre este viaje.</p>
                )}
              </div>
              <MessageComposer
                endpoint="/api/portal/messages"
                payload={{ threadId: thread?.id, orderId: order.id, subject: `Dudas sobre ${order.title}` }}
                placeholder="Escribe aqui cualquier duda sobre pagos, documentos, hoteles, salidas o cambios."
                buttonLabel="Enviar mensaje"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Pagos pendientes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {pendingSchedules.length > 0 ? (
                pendingSchedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">{schedule.dueType}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Vence {schedule.dueDate.toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <p className="text-xl font-semibold text-slate-950">{formatCurrency(Number(schedule.amount))}</p>
                    </div>
                    <div className="mt-4">
                      <CreateCheckoutButton
                        orderId={order.id}
                        scheduleId={schedule.id}
                        audience="client"
                        label={`Pagar ${schedule.dueType.toLowerCase()} con Mercado Pago`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No tienes pagos pendientes en este momento.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Documentos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.documents.length > 0 ? (
                order.documents.map((document) => (
                  <div key={document.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <p className="font-medium text-slate-950">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{document.type}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Aun no hay documentos publicados para este viaje.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Itinerario</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">
              {order.itinerary?.summary ?? order.customerVisibleNotes ?? "Tu itinerario final aparecera aqui junto con indicaciones y documentos visibles."}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
