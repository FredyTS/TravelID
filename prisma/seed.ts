import { hash } from "bcryptjs";
import {
  DiscountType,
  PrismaClient,
  PromotionAppliesTo,
  RoleKey,
  SupplierStatus,
  TravelType,
} from "@prisma/client";
import { env } from "@/lib/env";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { key: RoleKey.SUPERADMIN, name: "Superadmin" },
    { key: RoleKey.ADMIN, name: "Admin" },
    { key: RoleKey.AGENT, name: "Agente" },
    { key: RoleKey.CLIENT, name: "Cliente" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      update: { name: role.name },
      create: role,
    });
  }

  const superadminPassword = await hash(env.seedSuperadminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: env.seedSuperadminEmail },
    update: {
      firstName: "Alondra",
      lastName: "Admin",
      passwordHash: superadminPassword,
    },
    create: {
      email: env.seedSuperadminEmail,
      firstName: "Alondra",
      lastName: "Admin",
      passwordHash: superadminPassword,
    },
  });

  const superadminRole = await prisma.role.findUniqueOrThrow({
    where: { key: RoleKey.SUPERADMIN },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superadminRole.id,
    },
  });

  const cancun = await prisma.destination.upsert({
    where: { slug: "cancun" },
    update: {
      name: "Cancun",
      country: "Mexico",
      description: "Destino semilla para el catalogo publico del MVP.",
    },
    create: {
      name: "Cancun",
      slug: "cancun",
      country: "Mexico",
      description: "Destino semilla para el catalogo publico del MVP.",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { code: "OM1" },
    update: {
      name: "Creatur",
      displayName: "Creatur",
      commercialName: "Operadora Creatur",
      status: SupplierStatus.ACTIVE,
      phone: "(614) 469-62-79",
      email: "alondratravelmx@gmail.com",
    },
    create: {
      code: "OM1",
      name: "Creatur",
      displayName: "Creatur",
      commercialName: "Operadora Creatur",
      status: SupplierStatus.ACTIVE,
      phone: "(614) 469-62-79",
      email: "alondratravelmx@gmail.com",
    },
  });

  const mealPlans = await Promise.all([
    prisma.mealPlan.upsert({
      where: { code: "AI" },
      update: { name: "All Inclusive", description: "Alimentos, bebidas y amenidades incluidas." },
      create: { code: "AI", name: "All Inclusive", description: "Alimentos, bebidas y amenidades incluidas." },
    }),
    prisma.mealPlan.upsert({
      where: { code: "EP" },
      update: { name: "Plan Europeo", description: "Solo hospedaje." },
      create: { code: "EP", name: "Plan Europeo", description: "Solo hospedaje." },
    }),
    prisma.mealPlan.upsert({
      where: { code: "AD" },
      update: { name: "Alojamiento y desayuno", description: "Hospedaje con desayuno incluido." },
      create: { code: "AD", name: "Alojamiento y desayuno", description: "Hospedaje con desayuno incluido." },
    }),
  ]);

  const amenityCatalog = [
    { code: "POOL", name: "Alberca", description: "Hotel con alberca." },
    { code: "SPA", name: "Spa", description: "Servicio de spa o wellness." },
    { code: "GYM", name: "Gym", description: "Gimnasio disponible." },
    { code: "WIFI", name: "Wifi", description: "Internet disponible." },
    { code: "AIR_CONDITIONING", name: "Aire acondicionado", description: "Habitaciones con aire acondicionado." },
    { code: "PARKING", name: "Estacionamiento", description: "Estacionamiento disponible." },
    { code: "PET_FRIENDLY", name: "Acepta mascotas", description: "Propiedad pet friendly." },
    { code: "BEACH_ACCESS", name: "Acceso a playa", description: "Hotel con acceso a playa." },
  ];

  for (const [index, amenity] of amenityCatalog.entries()) {
    await prisma.hotelAmenity.upsert({
      where: { code: amenity.code },
      update: {
        name: amenity.name,
        description: amenity.description,
        sortOrder: index,
      },
      create: {
        code: amenity.code,
        name: amenity.name,
        description: amenity.description,
        sortOrder: index,
      },
    });
  }

  const hotel = await prisma.hotel.upsert({
    where: {
      destinationId_slug: {
        destinationId: cancun.id,
        slug: "hotel-cancun-resort",
      },
    },
    update: {
      supplierId: supplier.id,
      legacyHotelCode: "101",
      name: "Hotel Cancun Resort",
      category: "5 estrellas",
      starRating: 5,
      propertyType: "Resort",
      shortDescription: "Resort frente al mar para venta inmediata y cotizacion personalizada.",
      address: "Zona Hotelera, Cancun, Quintana Roo, Mexico",
      phone: "998 000 0000",
      checkInTime: "15:00",
      checkOutTime: "12:00",
      extraChargesNotes: "Impuesto ambiental y resort fee sujetos a cambio.",
      internalNotes: "Proveedor preferente para salidas desde CDMX y Chihuahua.",
      description: "Resort all inclusive con amenidades familiares, acceso a playa y seguimiento comercial completo.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
      hasPool: true,
      hasSpa: true,
      hasGym: true,
      beachAccess: true,
      petFriendly: false,
      hasParking: true,
      hasWifi: true,
      hasAirConditioning: true,
      amenities: ["Alberca", "Spa", "Gym", "Wifi", "Aire acondicionado", "Playa"],
      isActive: true,
    },
    create: {
      supplierId: supplier.id,
      destinationId: cancun.id,
      legacyHotelCode: "101",
      name: "Hotel Cancun Resort",
      slug: "hotel-cancun-resort",
      category: "5 estrellas",
      starRating: 5,
      propertyType: "Resort",
      shortDescription: "Resort frente al mar para venta inmediata y cotizacion personalizada.",
      address: "Zona Hotelera, Cancun, Quintana Roo, Mexico",
      phone: "998 000 0000",
      checkInTime: "15:00",
      checkOutTime: "12:00",
      extraChargesNotes: "Impuesto ambiental y resort fee sujetos a cambio.",
      internalNotes: "Proveedor preferente para salidas desde CDMX y Chihuahua.",
      description: "Resort all inclusive con amenidades familiares, acceso a playa y seguimiento comercial completo.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
      hasPool: true,
      hasSpa: true,
      hasGym: true,
      beachAccess: true,
      petFriendly: false,
      hasParking: true,
      hasWifi: true,
      hasAirConditioning: true,
      amenities: ["Alberca", "Spa", "Gym", "Wifi", "Aire acondicionado", "Playa"],
      isActive: true,
    },
  });

  for (const mealPlan of mealPlans) {
    await prisma.hotelMealPlan.upsert({
      where: {
        hotelId_mealPlanId: {
          hotelId: hotel.id,
          mealPlanId: mealPlan.id,
        },
      },
      update: {
        isAvailable: true,
      },
      create: {
        hotelId: hotel.id,
        mealPlanId: mealPlan.id,
        isAvailable: true,
      },
    });
  }

  const amenityRecords = await prisma.hotelAmenity.findMany({
    where: { code: { in: ["POOL", "SPA", "GYM", "WIFI", "AIR_CONDITIONING", "PARKING", "BEACH_ACCESS"] } },
  });

  for (const amenity of amenityRecords) {
    await prisma.hotelAmenityAssignment.upsert({
      where: {
        hotelId_amenityId: {
          hotelId: hotel.id,
          amenityId: amenity.id,
        },
      },
      update: { isAvailable: true },
      create: {
        hotelId: hotel.id,
        amenityId: amenity.id,
        isAvailable: true,
      },
    });
  }

  const allInclusivePlan = mealPlans.find((mealPlan) => mealPlan.code === "AI");

  const roomType = await prisma.hotelRoomType.upsert({
    where: {
      hotelId_name: {
        hotelId: hotel.id,
        name: "Junior Suite Ocean View",
      },
    },
    update: {
      code: "JSOV",
      mealPlanId: allInclusivePlan?.id,
      description: "Habitacion base para propuestas comerciales en Cancun.",
      maxAdults: 2,
      maxChildren: 2,
      isActive: true,
    },
    create: {
      hotelId: hotel.id,
      code: "JSOV",
      mealPlanId: allInclusivePlan?.id,
      name: "Junior Suite Ocean View",
      description: "Habitacion base para propuestas comerciales en Cancun.",
      maxAdults: 2,
      maxChildren: 2,
      isActive: true,
    },
  });

  const existingHotelImage = await prisma.hotelImage.findFirst({
    where: {
      hotelId: hotel.id,
      url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
    },
  });

  if (existingHotelImage) {
    await prisma.hotelImage.update({
      where: { id: existingHotelImage.id },
      data: {
        alt: "Vista principal del Hotel Cancun Resort",
        sortOrder: 0,
      },
    });
  } else {
    await prisma.hotelImage.create({
      data: {
        hotelId: hotel.id,
        url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
        alt: "Vista principal del Hotel Cancun Resort",
        sortOrder: 0,
      },
    });
  }

  await prisma.package.upsert({
    where: { slug: "escapada-cancun-all-inclusive" },
    update: {
      name: "Escapada Cancun All Inclusive",
      summary: "4 noches frente al mar con traslados, hotel all inclusive y seguimiento antes de viajar.",
      description: "Incluye hospedaje, traslados y estructura base para cotizacion, pedido, pago y portal del cliente.",
      locationLabel: "Caribe Mexicano",
      departureCity: "Ciudad de Mexico",
      heroImageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80",
      ],
      marketingTags: ["All inclusive", "Traslados", "Playa"],
      highlight: "Anticipo desde $3,500 MXN",
      durationDays: 5,
      durationNights: 4,
      travelType: TravelType.BEACH,
      basePriceFrom: 12990,
      destinationId: cancun.id,
      hotelId: hotel.id,
      supplierId: supplier.id,
      mealPlanId: allInclusivePlan?.id,
      defaultRoomTypeId: roomType.id,
      includedAdults: 2,
      includedMinors: 0,
      directBookable: true,
      bookingConditionsSummary: "Precio publicado para salida desde Ciudad de Mexico en Junior Suite Ocean View con plan all inclusive.",
      priceBasis: "Tarifa publicada desde Ciudad de Mexico para 2 adultos.",
      reservationNote: "Precio publicado para salida desde Ciudad de Mexico. Si cambian ciudad de salida o viajeros, conviene cotizacion personalizada.",
      featured: true,
      publishedAt: new Date(),
    },
    create: {
      name: "Escapada Cancun All Inclusive",
      slug: "escapada-cancun-all-inclusive",
      summary: "4 noches frente al mar con traslados, hotel all inclusive y seguimiento antes de viajar.",
      description: "Incluye hospedaje, traslados y estructura base para cotizacion, pedido, pago y portal del cliente.",
      locationLabel: "Caribe Mexicano",
      departureCity: "Ciudad de Mexico",
      heroImageUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      galleryUrls: [
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=900&q=80",
      ],
      marketingTags: ["All inclusive", "Traslados", "Playa"],
      highlight: "Anticipo desde $3,500 MXN",
      durationDays: 5,
      durationNights: 4,
      travelType: TravelType.BEACH,
      basePriceFrom: 12990,
      destinationId: cancun.id,
      hotelId: hotel.id,
      supplierId: supplier.id,
      mealPlanId: allInclusivePlan?.id,
      defaultRoomTypeId: roomType.id,
      includedAdults: 2,
      includedMinors: 0,
      directBookable: true,
      bookingConditionsSummary: "Precio publicado para salida desde Ciudad de Mexico en Junior Suite Ocean View con plan all inclusive.",
      priceBasis: "Tarifa publicada desde Ciudad de Mexico para 2 adultos.",
      reservationNote: "Precio publicado para salida desde Ciudad de Mexico. Si cambian ciudad de salida o viajeros, conviene cotizacion personalizada.",
      featured: true,
      publishedAt: new Date(),
    },
  });

  await prisma.promotion.upsert({
    where: { slug: "verano-caribe-mx" },
    update: {
      name: "Verano Caribe MX",
      description: "Descuento comercial para mover reservas del Caribe mexicano durante temporada alta.",
      discountType: DiscountType.PERCENT,
      discountValue: 12,
      appliesTo: PromotionAppliesTo.PACKAGE,
      packageId: (await prisma.package.findUniqueOrThrow({
        where: { slug: "escapada-cancun-all-inclusive" },
      })).id,
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2026-08-31"),
      isPublic: true,
      isActive: true,
    },
    create: {
      name: "Verano Caribe MX",
      slug: "verano-caribe-mx",
      description: "Descuento comercial para mover reservas del Caribe mexicano durante temporada alta.",
      discountType: DiscountType.PERCENT,
      discountValue: 12,
      appliesTo: PromotionAppliesTo.PACKAGE,
      packageId: (await prisma.package.findUniqueOrThrow({
        where: { slug: "escapada-cancun-all-inclusive" },
      })).id,
      startsAt: new Date("2026-04-01"),
      endsAt: new Date("2026-08-31"),
      isPublic: true,
      isActive: true,
    },
  });

  await prisma.setting.upsert({
    where: { key: "brand.profile" },
    update: {
      value: {
        name: "Alondra Travel MX",
        locale: "es-MX",
        currency: "MXN",
        portalMode: "full",
      },
    },
    create: {
      key: "brand.profile",
      value: {
        name: "Alondra Travel MX",
        locale: "es-MX",
        currency: "MXN",
        portalMode: "full",
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
