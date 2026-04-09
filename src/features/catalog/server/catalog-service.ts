import {
  DiscountType,
  PackageVisibility,
  Prisma,
  TravelType,
  type Destination,
  type Package,
  type Promotion,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const publicPackageInclude = {
  destination: true,
  hotel: true,
  mealPlan: true,
  supplier: true,
  defaultRoomType: true,
} satisfies Prisma.PackageInclude;

type PublicPackageRecord = Prisma.PackageGetPayload<{
  include: typeof publicPackageInclude;
}>;

const adminPackageInclude = {
  destination: true,
  hotel: true,
  supplier: true,
  mealPlan: true,
  defaultRoomType: true,
  promotions: true,
} satisfies Prisma.PackageInclude;

export type AdminPackageRecord = Prisma.PackageGetPayload<{
  include: typeof adminPackageInclude;
}>;

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function asStringArray(value: Prisma.JsonValue | null | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function formatTravelType(travelType: TravelType) {
  const labels: Record<TravelType, string> = {
    BEACH: "Playa",
    CITY: "Ciudad",
    ADVENTURE: "Aventura",
    HONEYMOON: "Luna de miel",
    FAMILY: "Familiar",
    CRUISE: "Crucero",
    CUSTOM: "Personalizado",
  };

  return labels[travelType];
}

function buildIncludedTravelers(record: Pick<Package, "includedAdults" | "includedMinors">) {
  const parts = [`${record.includedAdults} adulto${record.includedAdults === 1 ? "" : "s"}`];

  if (record.includedMinors > 0) {
    parts.push(`${record.includedMinors} menor${record.includedMinors === 1 ? "" : "es"}`);
  }

  return parts.join(" y ");
}

function buildDuration(record: Pick<Package, "durationDays" | "durationNights">) {
  return `${record.durationDays} dias / ${record.durationNights} noches`;
}

function mapPackageForPublic(record: PublicPackageRecord) {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    destination: record.destination.name,
    hotelName: record.hotel?.name ?? null,
    mealPlanName: record.mealPlan?.name ?? null,
    supplierName: record.supplier?.displayName ?? record.supplier?.name ?? null,
    roomTypeName: record.defaultRoomType?.name ?? null,
    location:
      record.locationLabel ?? record.destination.region ?? record.destination.country ?? "Mexico",
    departureCity: record.departureCity ?? "Ciudad de Mexico",
    summary: record.summary,
    description: record.description,
    duration: buildDuration(record),
    durationDays: record.durationDays,
    durationNights: record.durationNights,
    priceFrom: decimalToNumber(record.basePriceFrom),
    travelType: formatTravelType(record.travelType),
    featured: record.featured,
    highlight: record.highlight ?? "Consulta disponibilidad y condiciones.",
    heroImage:
      record.heroImageUrl ??
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    gallery: asStringArray(record.galleryUrls),
    tags: asStringArray(record.marketingTags),
    includedTravelers: buildIncludedTravelers(record),
    directBookable: record.directBookable,
    bookingConditionsSummary:
      record.bookingConditionsSummary ??
      `${record.departureCity ?? "Ciudad de Mexico"} · ${record.defaultRoomType?.name ?? "Habitacion base"} · ${record.mealPlan?.name ?? "Plan por confirmar"}`,
    priceBasis: record.priceBasis ?? null,
    reservationNote:
      record.reservationNote ??
      "El precio publicado aplica para la ciudad de salida indicada. Si cambian viajeros, edades o ciudad de salida, conviene una cotizacion personalizada.",
  };
}

function formatDiscountLabel(promotion: Pick<Promotion, "discountType" | "discountValue">) {
  const value = decimalToNumber(promotion.discountValue);

  if (promotion.discountType === DiscountType.PERCENT) {
    return `Hasta ${value}% OFF`;
  }

  return `Ahorra $${value.toLocaleString("es-MX")} MXN`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function mapPromotionForPublic(
  record: Promotion & {
    package: Pick<Package, "name" | "slug"> | null;
    destination: Pick<Destination, "name" | "slug"> | null;
  },
) {
  return {
    id: record.id,
    slug: record.slug,
    title: record.name,
    description: record.description ?? "Promocion activa lista para publicarse.",
    discountLabel: formatDiscountLabel(record),
    validUntil: formatDate(record.endsAt),
    appliesToLabel: record.package?.name ?? record.destination?.name ?? "Catalogo general",
  };
}

export async function getFeaturedPackages() {
  const records = await prisma.package.findMany({
    where: {
      visibility: PackageVisibility.PUBLIC,
      isActive: true,
      featured: true,
    },
    include: publicPackageInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return records.map(mapPackageForPublic);
}

export async function getCatalogPackages(filters?: {
  destination?: string;
  travelType?: string;
  q?: string;
}) {
  const records = await prisma.package.findMany({
    where: {
      visibility: PackageVisibility.PUBLIC,
      isActive: true,
      ...(filters?.destination
        ? {
            destination: {
              slug: filters.destination,
            },
          }
        : {}),
      ...(filters?.travelType
        ? {
            travelType: filters.travelType as TravelType,
          }
        : {}),
      ...(filters?.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" } },
              { summary: { contains: filters.q, mode: "insensitive" } },
              { description: { contains: filters.q, mode: "insensitive" } },
              { destination: { name: { contains: filters.q, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: publicPackageInclude,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return records.map(mapPackageForPublic);
}

export async function getPackageBySlug(slug: string) {
  const record = await prisma.package.findFirst({
    where: {
      slug,
      visibility: PackageVisibility.PUBLIC,
      isActive: true,
    },
    include: publicPackageInclude,
  });

  return record ? mapPackageForPublic(record) : null;
}

export async function getSalesPackageBySlug(slug: string) {
  return prisma.package.findUnique({
    where: { slug },
    include: {
      destination: true,
      hotel: true,
      supplier: true,
      mealPlan: true,
      defaultRoomType: true,
    },
  });
}

export async function getPromotions() {
  const records = await prisma.promotion.findMany({
    where: {
      isActive: true,
      isPublic: true,
    },
    include: {
      package: {
        select: {
          name: true,
          slug: true,
        },
      },
      destination: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ endsAt: "asc" }, { createdAt: "desc" }],
  });

  return records.map(mapPromotionForPublic);
}

export async function getPromotionBySlug(slug: string) {
  const record = await prisma.promotion.findFirst({
    where: {
      slug,
      isActive: true,
      isPublic: true,
    },
    include: {
      package: {
        select: {
          name: true,
          slug: true,
        },
      },
      destination: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return record ? mapPromotionForPublic(record) : null;
}

export async function getAdminCatalogOverview() {
  const [destinations, hotels, packages, promotions] = await Promise.all([
    prisma.destination.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            hotels: true,
            packages: true,
          },
        },
      },
    }),
    prisma.hotel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        destination: true,
        supplier: true,
        roomTypes: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
        mealPlans: {
          where: { isAvailable: true },
          include: { mealPlan: true },
          orderBy: { mealPlan: { name: "asc" } },
        },
      },
    }),
    prisma.package.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: adminPackageInclude,
    }),
    prisma.promotion.findMany({
      orderBy: [{ endsAt: "asc" }],
      include: {
        package: true,
        destination: true,
      },
    }),
  ]);

  return { destinations, hotels, packages, promotions };
}

export async function getDestinationOptions() {
  return prisma.destination.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getHotelOptions() {
  return prisma.hotel.findMany({
    where: { isActive: true },
    include: {
      destination: true,
      supplier: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      roomTypes: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
      mealPlans: {
        where: { isAvailable: true },
        include: { mealPlan: true },
        orderBy: { mealPlan: { name: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getPackageOptions() {
  return prisma.package.findMany({
    where: { isActive: true },
    include: {
      destination: true,
      hotel: true,
      mealPlan: true,
      supplier: true,
      defaultRoomType: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getSupplierOptions() {
  return prisma.supplier.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function getMealPlanOptions() {
  return prisma.mealPlan.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getHotelAmenityOptions() {
  return prisma.hotelAmenity.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getHotelRoomTypeOptions(hotelId?: string) {
  return prisma.hotelRoomType.findMany({
    where: {
      isActive: true,
      ...(hotelId ? { hotelId } : {}),
    },
    include: {
      hotel: {
        include: {
          destination: true,
        },
      },
      mealPlan: true,
    },
    orderBy: [{ hotel: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getDestinationById(id: string) {
  return prisma.destination.findUnique({
    where: { id },
  });
}

export async function getHotelById(id: string) {
  return prisma.hotel.findUnique({
    where: { id },
    include: {
      supplier: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      mealPlans: {
        include: {
          mealPlan: true,
        },
        orderBy: { mealPlan: { name: "asc" } },
      },
      amenityAssignments: {
        include: {
          amenity: true,
        },
        orderBy: { amenity: { sortOrder: "asc" } },
      },
      roomTypes: {
        include: {
          mealPlan: true,
        },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getAdminPackageById(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: adminPackageInclude,
  });
}

export async function getPromotionById(id: string) {
  return prisma.promotion.findUnique({
    where: { id },
    include: {
      package: true,
      destination: true,
    },
  });
}

export type DestinationOption = Awaited<ReturnType<typeof getDestinationOptions>>[number];
export type HotelOption = Awaited<ReturnType<typeof getHotelOptions>>[number];
