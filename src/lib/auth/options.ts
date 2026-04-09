import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { adminRoles } from "@/lib/auth/roles";
import { sendMagicLinkEmail } from "@/lib/email/transactional";
import { env } from "@/lib/env";

async function getUserPrimaryRole(userId: string) {
  const userRole = await prisma.userRole.findFirst({
    where: { userId },
    include: { role: true },
    orderBy: { assignedAt: "asc" },
  });

  return userRole?.role.key ?? null;
}

function splitUserName(name?: string | null) {
  const fallback = {
    firstName: "Cliente",
    lastName: "Portal",
  };

  if (!name?.trim()) {
    return fallback;
  }

  const [firstName, ...rest] = name.trim().split(/\s+/);

  return {
    firstName: firstName || fallback.firstName,
    lastName: rest.join(" ") || fallback.lastName,
  };
}

const prismaAdapter = PrismaAdapter(prisma);

const authAdapter: Adapter = {
  ...prismaAdapter,
  async createUser(data: Parameters<NonNullable<Adapter["createUser"]>>[0]) {
    const normalizedEmail = data.email?.toLowerCase();

    if (!normalizedEmail) {
      throw new Error("El usuario de acceso por email requiere un correo valido.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return existingUser;
    }

    const { firstName, lastName } = splitUserName(data.name);

    return prisma.user.create({
      data: {
        email: normalizedEmail,
        emailVerified: data.emailVerified,
        image: data.image,
        firstName,
        lastName,
      },
    });
  },
};

export const authOptions: NextAuthOptions = {
  adapter: authAdapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/acceso",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        };
      },
    }),
    EmailProvider({
      from: env.emailFrom,
      async sendVerificationRequest({ identifier, url }) {
        const host = new URL(url).host;

        await sendMagicLinkEmail({
          email: identifier,
          url,
          host,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub;

      if (userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            customerId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        });

        const role = await getUserPrimaryRole(userId);
        token.role = role;
        token.customerId = dbUser?.customerId ?? null;
        token.name =
          dbUser ? [dbUser.firstName, dbUser.lastName].filter(Boolean).join(" ") : token.name;
        token.email = dbUser?.email ?? token.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string | null) ?? null;
        session.user.customerId = (token.customerId as string | null) ?? null;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    },
  },
};

export function canAccessAdmin(role?: string | null) {
  return role ? adminRoles.includes(role as (typeof adminRoles)[number]) : false;
}
