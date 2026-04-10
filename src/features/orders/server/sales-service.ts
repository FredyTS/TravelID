import {
  OrderCreatedFrom,
  OrderStatus,
  PackageComponentType,
  PaymentDueType,
  PaymentScheduleStatus,
  Prisma,
  QuoteItemSourceType,
  QuoteSource,
  QuoteStatus,
  QuoteVisibility,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ensureCustomerPortalAccess } from "@/features/auth/server/customer-access";
import { getSalesPackageBySlug } from "@/features/catalog/server/catalog-service";
import { renderQuoteProposalHtml, type QuoteProposalData } from "@/features/quotes/server/proposal-template";
import { sendCustomerMessage } from "@/features/communications/server/communications-service";

function generateQuoteNumber() {
  return `Q-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

function generateOrderNumber() {
  return `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
}

function buildIncludedTravelersLabel(input: {
  includedAdults: number;
  includedMinors: number;
}) {
  const parts = [`${input.includedAdults} adulto${input.includedAdults === 1 ? "" : "s"}`];

  if (input.includedMinors > 0) {
    parts.push(`${input.includedMinors} menor${input.includedMinors === 1 ? "" : "es"}`);
  }

  return parts.join(" y ");
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isQuoteExpired(validUntil?: Date | null) {
  return Boolean(validUntil && validUntil.getTime() < Date.now());
}

export async function getDefaultAdminUserId() {
  const user = await prisma.user.findFirst({
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

  return user?.id ?? null;
}

export async function getOrCreateCustomer(input: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  source?: string;
}) {
  const existing = await prisma.customer.findFirst({
    where: {
      OR: [{ email: input.email }, { phone: input.phone ?? undefined }],
    },
  });

  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: {
        firstName: existing.firstName ?? input.firstName,
        lastName: existing.lastName ?? input.lastName,
        phone: existing.phone ?? input.phone,
      },
    });
  }

  return prisma.customer.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      source: input.source,
    },
  });
}

export async function createDirectReservation(input: {
  packageSlug: string;
  firstName: string;
  email: string;
  phone?: string;
  departureDate?: string;
  notes?: string;
}) {
  const travelPackage = await getSalesPackageBySlug(input.packageSlug);

  if (!travelPackage || !travelPackage.directBookable) {
    throw new Error("Este paquete no admite reserva inmediata con el precio publicado.");
  }

  const customer = await getOrCreateCustomer({
    firstName: input.firstName,
    email: input.email,
    phone: input.phone,
    source: "direct-reservation",
  });

  await ensureCustomerPortalAccess(customer.id);

  const adminUserId = await getDefaultAdminUserId();
  const subtotal = Number(travelPackage.basePriceFrom ?? 0);
  const deposit = Math.round(subtotal * 0.3);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId: customer.id,
      assignedAgentId: adminUserId,
      createdFrom: OrderCreatedFrom.CATALOG,
      status: OrderStatus.AWAITING_DEPOSIT,
      title: travelPackage.name,
      departureDate: input.departureDate ? new Date(input.departureDate) : undefined,
      subtotal,
      grandTotal: subtotal,
      balanceDue: subtotal,
      depositDueDate: new Date(),
      customerVisibleNotes: input.notes,
      items: {
        create: {
          itemType: PackageComponentType.OTHER,
          title: travelPackage.name,
          description: `${travelPackage.destination.name} · ${buildIncludedTravelersLabel(travelPackage)}`,
          unitPrice: subtotal,
          quantity: 1,
          lineTotal: subtotal,
          metadata: {
            departureCity: travelPackage.departureCity,
            supplierName: travelPackage.supplier?.displayName ?? travelPackage.supplier?.name ?? null,
            hotelName: travelPackage.hotel?.name ?? null,
            mealPlanName: travelPackage.mealPlan?.name ?? null,
            roomTypeName: travelPackage.defaultRoomType?.name ?? null,
            bookingConditionsSummary: travelPackage.bookingConditionsSummary ?? null,
            priceBasis: travelPackage.priceBasis ?? null,
          },
        },
      },
      paymentSchedules: {
        create: [
          {
            dueType: PaymentDueType.DEPOSIT,
            dueDate: new Date(),
            amount: deposit,
            status: PaymentScheduleStatus.PENDING,
          },
          {
            dueType: PaymentDueType.BALANCE,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
            amount: subtotal - deposit,
            status: PaymentScheduleStatus.PENDING,
          },
        ],
      },
    },
    include: {
      paymentSchedules: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Order",
      entityId: order.id,
      action: "DIRECT_RESERVATION_CREATED",
      description: `Reserva inmediata creada para ${travelPackage.name}.`,
      actorType: "PUBLIC",
      metadata: {
        packageSlug: input.packageSlug,
        departureCity: travelPackage.departureCity,
      },
    },
  });

  return order;
}

export async function createAdminQuote(input: {
  adminUserId: string;
  customerName: string;
  email: string;
  phone?: string;
  title: string;
  packageSlug?: string;
  originCity?: string;
  departureDateTentative?: string;
  adults: number;
  minors: number;
  subtotal: number;
  discountTotal?: number;
  depositRequired?: number;
  depositPercentage?: number;
  validUntil?: string;
  customerNotes?: string;
  proposalData?: QuoteProposalData | null;
  quoteItems?: Array<{
    itemType: PackageComponentType;
    title: string;
    description?: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    currency?: string;
    metadata?: Record<string, unknown>;
  }>;
}) {
  const [firstName, ...rest] = input.customerName.trim().split(" ");
  const lastName = rest.join(" ") || undefined;
  const customer = await getOrCreateCustomer({
    firstName,
    lastName,
    email: input.email,
    phone: input.phone,
    source: "admin-quote",
  });

  await ensureCustomerPortalAccess(customer.id);

  const matchedPackage = input.packageSlug ? await getSalesPackageBySlug(input.packageSlug) : null;

  const lineItems =
    input.quoteItems && input.quoteItems.length > 0
      ? input.quoteItems.map((item, index) => ({
          sourceType: matchedPackage ? QuoteItemSourceType.PACKAGE_COMPONENT : QuoteItemSourceType.MANUAL,
          itemType: item.itemType,
          title: item.title,
          description: item.description,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          currency: item.currency ?? "MXN",
          sortOrder: index,
          metadata: item.metadata as Prisma.InputJsonValue | undefined,
        }))
      : [
          {
            sourceType: matchedPackage ? QuoteItemSourceType.PACKAGE_COMPONENT : QuoteItemSourceType.MANUAL,
            itemType: PackageComponentType.OTHER,
            title: matchedPackage?.name ?? input.title,
            description: matchedPackage
              ? `${matchedPackage.destination.name} · ${buildIncludedTravelersLabel(matchedPackage)}`
              : "Cotizacion personalizada",
            unitPrice: input.subtotal ?? 0,
            quantity: 1,
            lineTotal: input.subtotal ?? 0,
            currency: "MXN",
            metadata: (input.proposalData
              ? {
                  proposalHotel: input.proposalData.hotels[0] ?? null,
                  proposalFlight: input.proposalData.flights ?? null,
                  proposalTransfer: input.proposalData.transfer ?? null,
                }
              : undefined) as Prisma.InputJsonValue | undefined,
          },
        ];

  const subtotal = roundCurrency(lineItems.reduce((sum, item) => sum + Number(item.lineTotal), 0));
  const discountTotal = roundCurrency(Math.min(input.discountTotal ?? 0, subtotal));
  const grandTotal = roundCurrency(Math.max(subtotal - discountTotal, 0));
  const depositPercentage = clamp(input.depositPercentage ?? 30, 0, 100);
  const depositRequired = roundCurrency(
    Math.min(input.depositRequired ?? grandTotal * (depositPercentage / 100), grandTotal),
  );
  const balanceDue = roundCurrency(Math.max(grandTotal - depositRequired, 0));
  const quoteNumber = generateQuoteNumber();
  const proposalHtml = input.proposalData
    ? await renderQuoteProposalHtml(input.proposalData, {
        quoteNumber,
        quoteTitle: input.title,
        subtotal: formatCurrency(subtotal),
        discountTotal: formatCurrency(discountTotal),
        grandTotal: formatCurrency(grandTotal),
        depositRequired: formatCurrency(depositRequired),
        balanceDue: formatCurrency(balanceDue),
        validUntil: input.validUntil ? new Date(input.validUntil).toLocaleDateString("es-MX") : "",
      })
    : null;

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      source: matchedPackage ? QuoteSource.CATALOG : QuoteSource.MANUAL,
      customerId: customer.id,
      packageId: matchedPackage?.id,
      destinationId: matchedPackage?.destinationId,
      assignedAgentId: input.adminUserId,
      status: QuoteStatus.DRAFT,
      visibility: QuoteVisibility.AUTH_PORTAL,
      title: input.title,
      originCity: input.originCity,
      departureDateTentative: input.departureDateTentative ? new Date(input.departureDateTentative) : undefined,
      adults: input.adults,
      minors: input.minors,
      subtotal,
      discountTotal,
      grandTotal,
      depositRequired,
      balanceDue,
      validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
      customerNotes: input.customerNotes,
      proposalData: input.proposalData ?? undefined,
      proposalHtml: proposalHtml ?? undefined,
      items: {
        create: lineItems,
      },
    },
    include: {
      customer: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Quote",
      entityId: quote.id,
      action: "QUOTE_CREATED",
      description: `Cotizacion ${quote.quoteNumber} creada.`,
      actorUserId: input.adminUserId,
      actorType: "USER",
      metadata: {
        customerId: customer.id,
        packageSlug: input.packageSlug,
      },
    },
  });

  return quote;
}

export async function markQuoteViewed(input: {
  quoteId: string;
  customerId: string;
}) {
  const quote = await prisma.quote.findFirst({
    where: {
      id: input.quoteId,
      customerId: input.customerId,
    },
  });

  if (!quote) {
    throw new Error("Cotizacion no encontrada.");
  }

  if (isQuoteExpired(quote.validUntil) && quote.status !== QuoteStatus.CONVERTED) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.EXPIRED,
      },
    });

    return prisma.quote.findUniqueOrThrow({
      where: { id: quote.id },
    });
  }

  if (quote.viewedAt) {
    return quote;
  }

  const nextStatus =
    quote.status === QuoteStatus.DRAFT || quote.status === QuoteStatus.SENT
      ? QuoteStatus.VIEWED
      : quote.status;

  const updatedQuote = await prisma.quote.update({
    where: { id: quote.id },
    data: {
      viewedAt: new Date(),
      status: nextStatus,
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Quote",
      entityId: quote.id,
      action: "QUOTE_VIEWED_IN_PORTAL",
      description: `El cliente abrio la cotizacion ${quote.quoteNumber} en el portal.`,
      actorType: "CLIENT",
      metadata: {
        customerId: input.customerId,
      },
    },
  });

  return updatedQuote;
}

export async function approveQuoteFromPortal(input: {
  quoteId: string;
  customerId: string;
}) {
  const quote = await prisma.quote.findFirst({
    where: {
      id: input.quoteId,
      customerId: input.customerId,
    },
    include: {
      convertedOrder: true,
    },
  });

  if (!quote) {
    throw new Error("Cotizacion no encontrada.");
  }

  if (quote.convertedOrder) {
    return quote.convertedOrder;
  }

  if (quote.status === QuoteStatus.CANCELLED || quote.status === QuoteStatus.REJECTED) {
    throw new Error("Esta cotizacion ya no puede aprobarse.");
  }

  if (isQuoteExpired(quote.validUntil)) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.EXPIRED,
      },
    });

    throw new Error("La vigencia de esta cotizacion ya vencio. Solicita una actualizacion.");
  }

  const adminUserId = (await getDefaultAdminUserId()) ?? quote.assignedAgentId;

  if (!adminUserId) {
    throw new Error("No existe un usuario admin disponible para completar la conversion.");
  }

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: QuoteStatus.APPROVED,
      approvedAt: quote.approvedAt ?? new Date(),
      viewedAt: quote.viewedAt ?? new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Quote",
      entityId: quote.id,
      action: "QUOTE_APPROVED_BY_CUSTOMER",
      description: `El cliente aprobo la cotizacion ${quote.quoteNumber} desde el portal.`,
      actorType: "CLIENT",
      metadata: {
        customerId: input.customerId,
      },
    },
  });

  return convertQuoteToOrder({
    quoteId: quote.id,
    adminUserId,
  });
}

export async function requestQuoteChangesFromPortal(input: {
  quoteId: string;
  customerId: string;
  body: string;
}) {
  const quote = await prisma.quote.findFirst({
    where: {
      id: input.quoteId,
      customerId: input.customerId,
    },
  });

  if (!quote) {
    throw new Error("Cotizacion no encontrada.");
  }

  if (quote.convertedOrderId) {
    throw new Error("Esta cotizacion ya fue convertida a pedido.");
  }

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: QuoteStatus.DRAFT,
      viewedAt: quote.viewedAt ?? new Date(),
    },
  });

  await sendCustomerMessage({
    customerId: input.customerId,
    quoteId: quote.id,
    subject: `Cambios solicitados para ${quote.quoteNumber}`,
    body: input.body,
  });

  await prisma.activityLog.create({
    data: {
      entityType: "Quote",
      entityId: quote.id,
      action: "QUOTE_CHANGES_REQUESTED",
      description: `El cliente solicito ajustes para la cotizacion ${quote.quoteNumber}.`,
      actorType: "CLIENT",
      metadata: {
        customerId: input.customerId,
      },
    },
  });

  return prisma.quote.findUniqueOrThrow({
    where: { id: quote.id },
  });
}

export async function rejectQuoteFromPortal(input: {
  quoteId: string;
  customerId: string;
  body?: string;
}) {
  const quote = await prisma.quote.findFirst({
    where: {
      id: input.quoteId,
      customerId: input.customerId,
    },
  });

  if (!quote) {
    throw new Error("Cotizacion no encontrada.");
  }

  if (quote.convertedOrderId) {
    throw new Error("Esta cotizacion ya fue convertida a pedido.");
  }

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: QuoteStatus.REJECTED,
      viewedAt: quote.viewedAt ?? new Date(),
    },
  });

  if (input.body?.trim()) {
    await sendCustomerMessage({
      customerId: input.customerId,
      quoteId: quote.id,
      subject: `Cotizacion ${quote.quoteNumber} descartada por el cliente`,
      body: input.body,
    });
  }

  await prisma.activityLog.create({
    data: {
      entityType: "Quote",
      entityId: quote.id,
      action: "QUOTE_REJECTED_BY_CUSTOMER",
      description: `El cliente descarto la cotizacion ${quote.quoteNumber}.`,
      actorType: "CLIENT",
      metadata: {
        customerId: input.customerId,
      },
    },
  });

  return prisma.quote.findUniqueOrThrow({
    where: { id: quote.id },
  });
}

export async function convertQuoteToOrder(input: {
  quoteId: string;
  adminUserId: string;
}) {
  const quote = await prisma.quote.findUnique({
    where: { id: input.quoteId },
    include: {
      customer: true,
      items: true,
      convertedOrder: true,
    },
  });

  if (!quote) {
    throw new Error("Cotizacion no encontrada.");
  }

  if (!quote.customerId) {
    throw new Error("La cotizacion no tiene cliente asociado.");
  }

  if (isQuoteExpired(quote.validUntil) && !quote.convertedOrderId) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.EXPIRED,
      },
    });

    throw new Error("La cotizacion ya vencio y no puede convertirse a pedido.");
  }

  await ensureCustomerPortalAccess(quote.customerId);

  if (quote.convertedOrderId || quote.convertedOrder) {
    return quote.convertedOrder;
  }

  const depositRequired = Number(quote.depositRequired);
  const grandTotal = Number(quote.grandTotal);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId: quote.customerId,
      quoteId: quote.id,
      assignedAgentId: input.adminUserId,
      createdFrom: OrderCreatedFrom.QUOTE,
      status: depositRequired > 0 ? OrderStatus.AWAITING_DEPOSIT : OrderStatus.PENDING_CONFIRMATION,
      title: quote.title,
      departureDate: quote.departureDateTentative,
      returnDate: quote.returnDateTentative,
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      taxTotal: quote.taxTotal,
      grandTotal: quote.grandTotal,
      balanceDue: quote.grandTotal,
      customerVisibleNotes: quote.customerNotes,
      internalNotes: quote.internalNotes,
      depositDueDate: new Date(),
      finalPaymentDueDate: quote.validUntil ?? undefined,
      items: {
        create: quote.items.map((item) => ({
          quoteItemId: item.id,
          itemType: item.itemType,
          title: item.title,
          description: item.description,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
          currency: item.currency,
          sortOrder: item.sortOrder,
          metadata: item.metadata ?? undefined,
        })),
      },
      paymentSchedules: {
        create: [
          {
            dueType: PaymentDueType.DEPOSIT,
            dueDate: new Date(),
            amount: depositRequired,
            status: PaymentScheduleStatus.PENDING,
          },
          {
            dueType: PaymentDueType.BALANCE,
            dueDate: quote.validUntil ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
            amount: grandTotal - depositRequired,
            status: PaymentScheduleStatus.PENDING,
          },
        ],
      },
    },
  });

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: QuoteStatus.CONVERTED,
      convertedOrderId: order.id,
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        entityType: "Quote",
        entityId: quote.id,
        action: "QUOTE_CONVERTED",
        description: `Cotizacion ${quote.quoteNumber} convertida a pedido.`,
        actorUserId: input.adminUserId,
        actorType: "USER",
        metadata: { orderId: order.id },
      },
      {
        entityType: "Order",
        entityId: order.id,
        action: "ORDER_CREATED_FROM_QUOTE",
        description: `Pedido ${order.orderNumber} creado desde cotizacion.`,
        actorUserId: input.adminUserId,
        actorType: "USER",
        metadata: { quoteId: quote.id },
      },
    ],
  });

  return order;
}
