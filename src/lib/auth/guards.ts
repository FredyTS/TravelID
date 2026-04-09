import { getServerSession } from "next-auth";
import { authOptions, canAccessAdmin } from "@/lib/auth/options";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !canAccessAdmin(session.user.role)) {
    return null;
  }

  return session;
}
