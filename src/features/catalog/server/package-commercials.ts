import {
  PackageComponentType,
  type Package,
  type PackageComponent,
  type Prisma,
} from "@prisma/client";

type JsonRecord = Record<string, unknown>;

export type PackageCommercialComponentInput = {
  type: PackageComponentType;
  title: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  currency?: string;
  isIncluded?: boolean;
  supplierId?: string | null;
  hotelId?: string | null;
  roomTypeId?: string | null;
  mealPlanId?: string | null;
  originCity?: string | null;
  destinationCity?: string | null;
  pricingReference?: string | null;
  notes?: string | null;
};

export type PackageCommercialLineItem = {
  id?: string;
  type: PackageComponentType;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  isIncluded: boolean;
  supplierId: string | null;
  hotelId: string | null;
  roomTypeId: string | null;
  mealPlanId: string | null;
  originCity: string | null;
  destinationCity: string | null;
  pricingReference: string | null;
  notes: string | null;
};

export type PackageCommercialBreakdown = {
  pricedItems: PackageCommercialLineItem[];
  includedItems: PackageCommercialLineItem[];
  optionalItems: PackageCommercialLineItem[];
  total: number;
  currency: string;
  hasStructuredPricing: boolean;
};

type PackageComponentRecord = Pick<
  PackageComponent,
  | "id"
  | "type"
  | "title"
  | "description"
  | "originCity"
  | "destinationCity"
  | "pricingReference"
  | "sortOrder"
  | "isIncluded"
  | "metadata"
  | "supplierId"
  | "hotelId"
  | "roomTypeId"
  | "mealPlanId"
>;

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function asRecord(value: Prisma.JsonValue | null | undefined): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as JsonRecord;
}

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  return fallback;
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildLineItemFromComponent(component: PackageComponentRecord): PackageCommercialLineItem {
  const metadata = asRecord(component.metadata);
  const quantity = Math.max(1, Math.round(parseNumber(metadata.quantity, 1)));
  const unitPrice = Math.max(0, roundCurrency(parseNumber(metadata.unitPrice, 0)));
  const lineTotal = Math.max(
    0,
    roundCurrency(parseNumber(metadata.lineTotal, roundCurrency(unitPrice * quantity))),
  );
  const currency = normalizeString(metadata.currency) ?? "MXN";

  return {
    id: component.id,
    type: component.type,
    title: component.title,
    description: component.description ?? null,
    quantity,
    unitPrice,
    lineTotal,
    currency,
    isIncluded: component.isIncluded,
    supplierId: component.supplierId ?? null,
    hotelId: component.hotelId ?? null,
    roomTypeId: component.roomTypeId ?? null,
    mealPlanId: component.mealPlanId ?? null,
    originCity: component.originCity ?? null,
    destinationCity: component.destinationCity ?? null,
    pricingReference: component.pricingReference ?? null,
    notes: normalizeString(metadata.notes),
  };
}

export function parsePackageCommercialComponents(
  value: FormDataEntryValue | null,
): PackageCommercialComponentInput[] {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return [];
  }

  const parsed = JSON.parse(normalized);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      const raw = (item ?? {}) as Record<string, unknown>;
      const title = normalizeString(raw.title);

      if (!title) {
        return null;
      }

      const parsedType = String(raw.type ?? PackageComponentType.OTHER) as PackageComponentType;
      const type = Object.values(PackageComponentType).includes(parsedType)
        ? parsedType
        : PackageComponentType.OTHER;

      return {
        type,
        title,
        description: normalizeString(raw.description) ?? undefined,
        quantity: Math.max(1, Math.round(parseNumber(raw.quantity, 1))),
        unitPrice: Math.max(0, roundCurrency(parseNumber(raw.unitPrice, 0))),
        currency: normalizeString(raw.currency) ?? "MXN",
        isIncluded: parseBoolean(raw.isIncluded, true),
        supplierId: normalizeString(raw.supplierId),
        hotelId: normalizeString(raw.hotelId),
        roomTypeId: normalizeString(raw.roomTypeId),
        mealPlanId: normalizeString(raw.mealPlanId),
        originCity: normalizeString(raw.originCity),
        destinationCity: normalizeString(raw.destinationCity),
        pricingReference: normalizeString(raw.pricingReference),
        notes: normalizeString(raw.notes),
      } satisfies PackageCommercialComponentInput;
    })
    .filter((item): item is PackageCommercialComponentInput => Boolean(item));
}

export function serializePackageCommercialMetadata(input: PackageCommercialComponentInput) {
  const quantity = Math.max(1, Math.round(parseNumber(input.quantity, 1)));
  const unitPrice = Math.max(0, roundCurrency(parseNumber(input.unitPrice, 0)));
  const lineTotal = roundCurrency(unitPrice * quantity);

  return {
    quantity,
    unitPrice,
    lineTotal,
    currency: normalizeString(input.currency) ?? "MXN",
    ...(normalizeString(input.notes) ? { notes: normalizeString(input.notes) } : {}),
  } satisfies Prisma.InputJsonValue;
}

export function buildPackageCommercialBreakdown(input: {
  packageBasePrice?: Prisma.Decimal | number | null;
  packageCurrency?: string | null;
  components?: PackageComponentRecord[] | null;
}): PackageCommercialBreakdown {
  const components = [...(input.components ?? [])].sort((left, right) => left.sortOrder - right.sortOrder);
  const pricedItems = components.map(buildLineItemFromComponent).filter((item) => item.lineTotal > 0);
  const includedItems = pricedItems.filter((item) => item.isIncluded);
  const optionalItems = pricedItems.filter((item) => !item.isIncluded);
  const total = roundCurrency(includedItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const currency = includedItems[0]?.currency ?? input.packageCurrency ?? "MXN";

  if (includedItems.length > 0) {
    return {
      pricedItems,
      includedItems,
      optionalItems,
      total,
      currency,
      hasStructuredPricing: true,
    };
  }

  return {
    pricedItems: [],
    includedItems: [],
    optionalItems: [],
    total: Math.max(0, roundCurrency(parseNumber(input.packageBasePrice, 0))),
    currency,
    hasStructuredPricing: false,
  };
}

export function getPackagePublishedPrice(input: {
  packageBasePrice?: Prisma.Decimal | number | null;
  packageCurrency?: string | null;
  components?: PackageComponentRecord[] | null;
}) {
  return buildPackageCommercialBreakdown(input).total;
}

export function buildPackageComponentCreateManyInput(
  packageId: string,
  components: PackageCommercialComponentInput[],
) {
  return components.map((component, index) => ({
    packageId,
    supplierId: component.supplierId ?? null,
    hotelId: component.hotelId ?? null,
    roomTypeId: component.roomTypeId ?? null,
    mealPlanId: component.mealPlanId ?? null,
    type: component.type,
    title: component.title,
    description: component.description ?? null,
    originCity: component.originCity ?? null,
    destinationCity: component.destinationCity ?? null,
    pricingReference: component.pricingReference ?? null,
    sortOrder: index,
    isIncluded: component.isIncluded ?? true,
    metadata: serializePackageCommercialMetadata(component),
  }));
}

export function buildPackageCommercialBreakdownFromInputs(input: {
  basePriceFrom?: number | Prisma.Decimal | null;
  baseCurrency?: string | null;
  components?: PackageCommercialComponentInput[] | null;
}) {
  return buildPackageCommercialBreakdown({
    packageBasePrice: input.basePriceFrom,
    packageCurrency: input.baseCurrency,
    components: (input.components ?? []).map((component, index) => ({
      id: `input-${index}`,
      type: component.type,
      title: component.title,
      description: component.description ?? null,
      originCity: component.originCity ?? null,
      destinationCity: component.destinationCity ?? null,
      pricingReference: component.pricingReference ?? null,
      sortOrder: index,
      isIncluded: component.isIncluded ?? true,
      metadata: serializePackageCommercialMetadata(component) as Prisma.JsonValue,
      supplierId: component.supplierId ?? null,
      hotelId: component.hotelId ?? null,
      roomTypeId: component.roomTypeId ?? null,
      mealPlanId: component.mealPlanId ?? null,
    })),
  });
}

export function validatePackageCommercialSetup(input: {
  directBookable: boolean;
  basePriceFrom?: number | Prisma.Decimal | null;
  baseCurrency?: string | null;
  components?: PackageCommercialComponentInput[] | PackageComponentRecord[] | null;
}) {
  const total = Array.isArray(input.components) && input.components.length > 0
    ? buildPackageCommercialBreakdownFromInputs({
        basePriceFrom: input.basePriceFrom,
        baseCurrency: input.baseCurrency,
        components: input.components as PackageCommercialComponentInput[],
      }).total
    : buildPackageCommercialBreakdown({
        packageBasePrice: input.basePriceFrom,
        packageCurrency: input.baseCurrency,
        components: null,
      }).total;

  if (input.directBookable && total <= 0) {
    throw new Error(
      "La reserva inmediata necesita un precio final mayor a 0. Agrega cargos al paquete o captura un precio publicado valido.",
    );
  }

  return total;
}

export function getPackageReservationItems(input: {
  packageName: string;
  destinationName: string;
  includedAdults: number;
  includedMinors: number;
  departureCity?: string | null;
  supplierName?: string | null;
  hotelName?: string | null;
  mealPlanName?: string | null;
  roomTypeName?: string | null;
  bookingConditionsSummary?: string | null;
  priceBasis?: string | null;
  packageBasePrice?: Prisma.Decimal | number | null;
  packageCurrency?: string | null;
  components?: PackageComponentRecord[] | null;
}) {
  const breakdown = buildPackageCommercialBreakdown({
    packageBasePrice: input.packageBasePrice,
    packageCurrency: input.packageCurrency,
    components: input.components,
  });

  if (breakdown.hasStructuredPricing) {
    return breakdown.includedItems.map((item, index) => ({
      itemType: item.type,
      title: item.title,
      description: item.description,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      currency: item.currency,
      sortOrder: index,
      supplierId: item.supplierId,
      metadata: {
        originCity: item.originCity,
        destinationCity: item.destinationCity,
        pricingReference: item.pricingReference,
        notes: item.notes,
      } satisfies Prisma.InputJsonValue,
    }));
  }

  return [
    {
      itemType: PackageComponentType.OTHER,
      title: input.packageName,
      description: `${input.destinationName} · ${input.includedAdults} adulto${input.includedAdults === 1 ? "" : "s"}${
        input.includedMinors > 0
          ? ` y ${input.includedMinors} menor${input.includedMinors === 1 ? "" : "es"}`
          : ""
      }`,
      unitPrice: breakdown.total,
      quantity: 1,
      lineTotal: breakdown.total,
      currency: breakdown.currency,
      sortOrder: 0,
      supplierId: null,
      metadata: {
        departureCity: input.departureCity ?? null,
        supplierName: input.supplierName ?? null,
        hotelName: input.hotelName ?? null,
        mealPlanName: input.mealPlanName ?? null,
        roomTypeName: input.roomTypeName ?? null,
        bookingConditionsSummary: input.bookingConditionsSummary ?? null,
        priceBasis: input.priceBasis ?? null,
      } satisfies Prisma.InputJsonValue,
    },
  ];
}

export function isReservationBookableComponent(type: PackageComponentType) {
  return (
    type === PackageComponentType.HOTEL ||
    type === PackageComponentType.FLIGHT ||
    type === PackageComponentType.TRANSFER ||
    type === PackageComponentType.TOUR ||
    type === PackageComponentType.OTHER
  );
}

export function deriveReservationNote(record: Pick<Package, "directBookable" | "reservationNote">) {
  if (record.reservationNote) {
    return record.reservationNote;
  }

  return record.directBookable
    ? "El precio publicado ya esta listo para apartarse. Si necesitas cambios en viajeros, ciudad de salida o servicios, solicita una cotizacion personalizada."
    : "Este paquete sirve como base comercial. Si necesitas apartarlo, primero genera una cotizacion personalizada.";
}
