import { DocumentVisibility } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getPortalOverview(customerId: string) {
  const [customer, activeOrder, activeQuote, orders, documents, threads] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        user: true,
      },
    }),
    prisma.order.findFirst({
      where: {
        customerId,
        portalEnabled: true,
      },
      orderBy: [{ departureDate: "asc" }, { createdAt: "desc" }],
      include: {
        paymentSchedules: {
          orderBy: { dueDate: "asc" },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        travelUpdates: {
          where: { visibility: "CLIENT" },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.quote.findFirst({
      where: {
        customerId,
        visibility: "AUTH_PORTAL",
        convertedOrderId: null,
        status: {
          in: ["DRAFT", "SENT", "VIEWED", "APPROVED"],
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.order.findMany({
      where: {
        customerId,
        portalEnabled: true,
      },
      orderBy: [{ createdAt: "desc" }],
      include: {
        paymentSchedules: {
          orderBy: { dueDate: "asc" },
        },
      },
    }),
    prisma.document.findMany({
      where: {
        visibility: DocumentVisibility.CLIENT,
        OR: [{ customerId }, { order: { customerId } }],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.conversationThread.findMany({
      where: { customerId },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: 3,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                senderRole: "ADMIN",
                readAt: null,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    customer,
    activeOrder,
    activeQuote,
    orders,
    documents,
    threads,
  };
}
