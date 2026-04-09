import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCheckoutButton } from "@/features/payments/components/create-checkout-button";
import { MessageComposer } from "@/features/communications/components/message-composer";
import {
  ensureConversationThread,
  getAdminThread,
} from "@/features/communications/server/communications-service";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
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
        orderBy: { createdAt: "desc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      itinerary: true,
    },
  });

  if (!order) {
    notFound();
  }

  const ensuredThread = await ensureConversationThread({
    customerId: order.customerId,
    orderId: order.id,
    subject: `Seguimiento ${order.title}`,
  });
  const thread = await getAdminThread(ensuredThread.id);

  return (
    <div className="space-y-6">
      <div className="surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Centro operativo</p>
            <h1 className="mt-3 text-4xl">Pedido {order.orderNumber}</h1>
            <p className="mt-2 text-slate-600">
              Cliente: {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "Sin cliente"}
            </p>
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
            <CardHeader><CardTitle>Resumen comercial</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.grandTotal))}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Pagado</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(Number(order.paidTotal))}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Saldo</p>
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
            <CardHeader><CardTitle>Conversacion con cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {thread?.messages.length ? (
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
                  <p className="text-sm text-slate-600">Todavia no hay mensajes asociados a este pedido.</p>
                )}
              </div>
              <MessageComposer
                endpoint="/api/admin/messages"
                payload={{ threadId: thread?.id }}
                placeholder="Escribe una respuesta para el cliente."
                buttonLabel="Enviar respuesta"
              />
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Timeline y notas visibles</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.travelUpdates.length > 0 ? (
                order.travelUpdates.map((entry) => (
                  <div key={entry.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <h3 className="font-medium text-slate-950">{entry.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{entry.message}</p>
                    <p className="mt-2 text-xs text-slate-400">{entry.visibility}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Aun no hay actualizaciones publicadas para este pedido.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Calendario de cobro</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.paymentSchedules.map((schedule) => (
                <div key={schedule.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{schedule.dueType}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Vence {schedule.dueDate.toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-950">{formatCurrency(Number(schedule.amount))}</p>
                      <p className="mt-1 text-xs text-slate-500">{schedule.status}</p>
                    </div>
                  </div>
                  {schedule.status === "PENDING" ? (
                    <div className="mt-4">
                      <CreateCheckoutButton
                        orderId={order.id}
                        scheduleId={schedule.id}
                        audience="admin"
                        label={`Generar link de ${schedule.dueType.toLowerCase()}`}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Historial de pagos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.payments.length > 0 ? (
                order.payments.map((payment) => (
                  <div key={payment.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-950">{payment.provider}</span>
                      <span className="font-medium text-slate-950">{formatCurrency(Number(payment.amount))}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {payment.status} · {payment.paidAt ? payment.paidAt.toLocaleDateString("es-MX") : "pendiente"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Aun no hay pagos registrados para este pedido.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white">
            <CardHeader><CardTitle>Documentos y entrega</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.documents.length > 0 ? (
                order.documents.map((document) => (
                  <div key={document.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                    <p className="font-medium text-slate-950">{document.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {document.type} · {document.visibility}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Todavia no hay documentos cargados para este pedido.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
