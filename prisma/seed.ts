import { hash } from "bcryptjs";
import { PrismaClient, RoleKey, TravelType } from "@prisma/client";
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
      summary: "Paquete semilla del scaffold",
      description: "Incluye hospedaje, traslados y estructura base para cotizacion y pedido.",
      durationDays: 5,
      durationNights: 4,
      travelType: TravelType.BEACH,
      basePriceFrom: 12990,
      destinationId: cancun.id,
      featured: true,
      publishedAt: new Date(),
    },
    create: {
      name: "Escapada Cancun All Inclusive",
      slug: "escapada-cancun-all-inclusive",
      summary: "Paquete semilla del scaffold",
      description: "Incluye hospedaje, traslados y estructura base para cotizacion y pedido.",
      durationDays: 5,
      durationNights: 4,
      travelType: TravelType.BEACH,
      basePriceFrom: 12990,
      destinationId: cancun.id,
      featured: true,
      publishedAt: new Date(),
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
