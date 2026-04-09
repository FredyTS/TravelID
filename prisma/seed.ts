import { hash } from "bcryptjs";
import { DiscountType, PrismaClient, PromotionAppliesTo, RoleKey, TravelType } from "@prisma/client";
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

  await prisma.package.upsert({
    where: { slug: "escapada-cancun-all-inclusive" },
    update: {
      name: "Escapada Cancun All Inclusive",
      summary: "4 noches frente al mar con traslados, hotel all inclusive y seguimiento antes de viajar.",
      description: "Incluye hospedaje, traslados y estructura base para cotizacion, pedido, pago y portal del cliente.",
      locationLabel: "Caribe Mexicano",
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
      includedAdults: 2,
      includedMinors: 0,
      directBookable: true,
      reservationNote: "Si viajan 2 adultos bajo estas condiciones, pueden reservar de inmediato.",
      featured: true,
      publishedAt: new Date(),
    },
    create: {
      name: "Escapada Cancun All Inclusive",
      slug: "escapada-cancun-all-inclusive",
      summary: "4 noches frente al mar con traslados, hotel all inclusive y seguimiento antes de viajar.",
      description: "Incluye hospedaje, traslados y estructura base para cotizacion, pedido, pago y portal del cliente.",
      locationLabel: "Caribe Mexicano",
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
      includedAdults: 2,
      includedMinors: 0,
      directBookable: true,
      reservationNote: "Si viajan 2 adultos bajo estas condiciones, pueden reservar de inmediato.",
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
