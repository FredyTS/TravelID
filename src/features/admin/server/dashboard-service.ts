import { prisma } from "@/lib/db/prisma";

export async function getAdminDashboardOverview() {
  const [
    leadsCount,
    quotesOpenCount,
    activeOrdersCount,
    pendingPayments,
    recentOrders,
    recentQuotes,
    unreadConversations,
  ] = await Promise.all([
    prisma.lead.count({
      where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } },
    }),
    prisma.quote.count({
      where: { status: { in: ["DRAFT", "SENT", "VIEWED", "APPROVED"] } },
    }),
    prisma.order.count({
      where: { status: { in: ["AWAITING_DEPOSIT", "PARTIALLY_PAID", "IN_PROGRESS"] } },
    }),
    prisma.order.aggregate({
      _sum: {
        balanceDue: true,
      },
      where: {
        balanceDue: { gt: 0 },
      },
    }),
    prisma.order.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        customer: true,
      },
    }),
    prisma.quote.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        customer: true,
      },
    }),
    prisma.conversationThread.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: 5,
      include: {
        customer: true,
        _count: {
          select: {
            messages: {
              where: {
                senderRole: "CLIENT",
                readAt: null,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    stats: [
      {
        label: "Leads por atender",
        value: String(leadsCount),
        hint: "Solicitudes nuevas y en seguimiento",
      },
      {
        label: "Cotizaciones activas",
        value: String(quotesOpenCount),
        hint: "Pendientes por cerrar o convertir",
      },
      {
        label: "Pedidos en curso",
        value: String(activeOrdersCount),
        hint: "Viajes con cobro o documentacion abierta",
      },
      {
        label: "Cobranza pendiente",
        value: Number(pendingPayments._sum.balanceDue ?? 0),
        hint: "Saldo total por recuperar",
      },
    ],
    recentOrders,
    recentQuotes,
    unreadConversations,
  };
}
