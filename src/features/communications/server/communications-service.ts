import {
  ConversationParticipantRole,
  ConversationThreadType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { sendConversationNotificationEmail } from "@/lib/email/transactional";

const threadInclude = {
  customer: true,
  order: true,
  quote: true,
  participants: {
    include: {
      user: true,
      customer: true,
    },
  },
  messages: {
    orderBy: { createdAt: "asc" },
    include: {
      senderUser: true,
      customer: true,
    },
  },
} satisfies Prisma.ConversationThreadInclude;

async function getPrimaryAdminUser() {
  return prisma.user.findFirst({
    where: {
      roles: {
        some: {
          role: {
            key: {
              in: ["SUPERADMIN", "ADMIN"],
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function ensureConversationThread(input: {
  customerId: string;
  orderId?: string;
  quoteId?: string;
  subject: string;
  threadType?: ConversationThreadType;
  adminUserId?: string | null;
}) {
  const threadType =
    input.threadType ??
    (input.orderId
      ? ConversationThreadType.ORDER
      : input.quoteId
        ? ConversationThreadType.QUOTE
        : ConversationThreadType.GENERAL);

  const existing = await prisma.conversationThread.findFirst({
    where: {
      customerId: input.customerId,
      orderId: input.orderId ?? null,
      quoteId: input.quoteId ?? null,
      threadType,
    },
    include: threadInclude,
  });

  if (existing) {
    return existing;
  }

  const adminUser = input.adminUserId
    ? await prisma.user.findUnique({ where: { id: input.adminUserId } })
    : await getPrimaryAdminUser();

  const thread = await prisma.conversationThread.create({
    data: {
      customerId: input.customerId,
      orderId: input.orderId,
      quoteId: input.quoteId,
      subject: input.subject,
      threadType,
      participants: {
        create: [
          {
            customerId: input.customerId,
            role: ConversationParticipantRole.CLIENT,
          },
          ...(adminUser
            ? [
                {
                  userId: adminUser.id,
                  role: ConversationParticipantRole.ADMIN,
                },
              ]
            : []),
        ],
      },
    },
    include: threadInclude,
  });

  return thread;
}

function buildThreadUrl(role: ConversationParticipantRole, threadId: string) {
  return role === ConversationParticipantRole.ADMIN
    ? `${env.appUrl}/admin/conversations/${threadId}`
    : `${env.appUrl}/portal/inbox/${threadId}`;
}

async function notifyCounterpart(input: {
  threadId: string;
  senderRole: ConversationParticipantRole;
  body: string;
}) {
  const thread = await prisma.conversationThread.findUnique({
    where: { id: input.threadId },
    include: {
      customer: true,
      participants: {
        include: {
          user: true,
          customer: true,
        },
      },
    },
  });

  if (!thread) {
    return;
  }

  if (input.senderRole === ConversationParticipantRole.CLIENT) {
    const adminParticipant = thread.participants.find(
      (participant) => participant.role === ConversationParticipantRole.ADMIN && participant.user?.email,
    );

    if (!adminParticipant?.user?.email) {
      return;
    }

    await sendConversationNotificationEmail({
      email: adminParticipant.user.email,
      recipientName: adminParticipant.user.firstName,
      subject: `Nuevo mensaje de ${thread.customer.firstName ?? "cliente"} en ${thread.subject}`,
      preview: input.body,
      ctaUrl: buildThreadUrl(ConversationParticipantRole.ADMIN, input.threadId),
      ctaLabel: "Abrir conversación",
    });

    return;
  }

  if (!thread.customer.email) {
    return;
  }

  await sendConversationNotificationEmail({
    email: thread.customer.email,
    recipientName: thread.customer.firstName,
    subject: `Tienes una respuesta de Alondra Travel MX`,
    preview: input.body,
    ctaUrl: buildThreadUrl(ConversationParticipantRole.CLIENT, input.threadId),
    ctaLabel: "Ver respuesta",
  });
}

async function markMessagesAsReadForRole(threadId: string, role: ConversationParticipantRole) {
  await prisma.conversationMessage.updateMany({
    where: {
      threadId,
      senderRole:
        role === ConversationParticipantRole.ADMIN
          ? ConversationParticipantRole.CLIENT
          : ConversationParticipantRole.ADMIN,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function listThreadsForCustomer(customerId: string) {
  return prisma.conversationThread.findMany({
    where: { customerId },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      _count: {
        select: {
          messages: {
            where: {
              senderRole: ConversationParticipantRole.ADMIN,
              readAt: null,
            },
          },
        },
      },
      order: true,
      quote: true,
    },
  });
}

export async function listThreadsForAdmin() {
  return prisma.conversationThread.findMany({
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      customer: true,
      order: true,
      quote: true,
      _count: {
        select: {
          messages: {
            where: {
              senderRole: ConversationParticipantRole.CLIENT,
              readAt: null,
            },
          },
        },
      },
    },
  });
}

export async function getCustomerThread(threadId: string, customerId: string) {
  const thread = await prisma.conversationThread.findFirst({
    where: {
      id: threadId,
      customerId,
    },
    include: threadInclude,
  });

  if (!thread) {
    return null;
  }

  await markMessagesAsReadForRole(threadId, ConversationParticipantRole.CLIENT);

  return thread;
}

export async function getAdminThread(threadId: string) {
  const thread = await prisma.conversationThread.findUnique({
    where: { id: threadId },
    include: threadInclude,
  });

  if (!thread) {
    return null;
  }

  await markMessagesAsReadForRole(threadId, ConversationParticipantRole.ADMIN);

  return thread;
}

async function createMessage(input: {
  threadId: string;
  senderRole: ConversationParticipantRole;
  body: string;
  senderUserId?: string;
  customerId?: string;
}) {
  const message = await prisma.conversationMessage.create({
    data: {
      threadId: input.threadId,
      senderRole: input.senderRole,
      body: input.body,
      senderUserId: input.senderUserId,
      customerId: input.customerId,
    },
    include: {
      senderUser: true,
      customer: true,
    },
  });

  await prisma.conversationThread.update({
    where: { id: input.threadId },
    data: {
      lastMessageAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "ConversationThread",
      entityId: input.threadId,
      action: "MESSAGE_SENT",
      description:
        input.senderRole === ConversationParticipantRole.ADMIN
          ? "Admin envio una respuesta al cliente."
          : "Cliente envio una duda o seguimiento.",
      actorUserId: input.senderUserId,
      actorType: input.senderRole,
      metadata: {
        customerId: input.customerId,
      },
    },
  });

  await notifyCounterpart({
    threadId: input.threadId,
    senderRole: input.senderRole,
    body: input.body,
  });

  return message;
}

export async function sendCustomerMessage(input: {
  customerId: string;
  threadId?: string;
  orderId?: string;
  quoteId?: string;
  subject?: string;
  body: string;
}) {
  const thread =
    input.threadId
      ? await prisma.conversationThread.findFirst({
          where: { id: input.threadId, customerId: input.customerId },
        })
      : await ensureConversationThread({
          customerId: input.customerId,
          orderId: input.orderId,
          quoteId: input.quoteId,
          subject: input.subject ?? "Consulta general",
        });

  if (!thread) {
    throw new Error("No se encontro la conversacion.");
  }

  return createMessage({
    threadId: thread.id,
    senderRole: ConversationParticipantRole.CLIENT,
    body: input.body,
    customerId: input.customerId,
  });
}

export async function sendAdminMessage(input: {
  threadId: string;
  adminUserId: string;
  body: string;
}) {
  const thread = await prisma.conversationThread.findUnique({
    where: { id: input.threadId },
  });

  if (!thread) {
    throw new Error("No se encontro la conversacion.");
  }

  return createMessage({
    threadId: input.threadId,
    senderRole: ConversationParticipantRole.ADMIN,
    body: input.body,
    senderUserId: input.adminUserId,
    customerId: thread.customerId,
  });
}
