import { RoleKey, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function ensureCustomerPortalAccess(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      user: {
        select: {
          id: true,
          email: true,
          customerId: true,
        },
      },
    },
  });

  if (!customer?.email) {
    return null;
  }

  const clientRole = await prisma.role.findUnique({
    where: { key: RoleKey.CLIENT },
    select: { id: true },
  });

  if (!clientRole) {
    throw new Error("El rol CLIENT no existe en la base de datos.");
  }

  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: customer.email.toLowerCase() },
    select: {
      id: true,
      customerId: true,
    },
  });

  const user = customer.user
    ? await prisma.user.update({
        where: { id: customer.user.id },
        data: {
          email: customer.email.toLowerCase(),
          firstName: customer.firstName ?? "Cliente",
          lastName: customer.lastName ?? "",
          phone: customer.phone,
          status: UserStatus.ACTIVE,
        },
      })
    : existingUserByEmail
      ? await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            customerId,
            firstName: customer.firstName ?? "Cliente",
            lastName: customer.lastName ?? "",
            phone: customer.phone,
            status: UserStatus.ACTIVE,
          },
        })
      : await prisma.user.create({
          data: {
            email: customer.email.toLowerCase(),
            customerId,
            firstName: customer.firstName ?? "Cliente",
            lastName: customer.lastName ?? "",
            phone: customer.phone,
            status: UserStatus.ACTIVE,
          },
        });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: clientRole.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: clientRole.id,
    },
  });

  return user;
}
