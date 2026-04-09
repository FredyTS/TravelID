import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { adminRoles } from "@/lib/auth/roles";

async function getUserPrimaryRole(userId: string) {
  const userRole = await prisma.userRole.findFirst({
    where: { userId },
    include: { role: true },
    orderBy: { assignedAt: "asc" },
  });

  return userRole?.role.key ?? null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
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
