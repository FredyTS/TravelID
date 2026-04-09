import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { canAccessCustomerResource } from "@/lib/permissions/policies";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  const { id } = await params;

  if (!session?.user.id) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id },
    select: {
      proposalHtml: true,
      customerId: true,
    },
  });

  if (!quote?.proposalHtml) {
    return new NextResponse("La cotizacion no tiene propuesta generada.", { status: 404 });
  }

  const isAdmin = Boolean(session.user.role && session.user.role !== "CLIENT");
  const canAccessAsCustomer = canAccessCustomerResource(session.user.customerId, quote.customerId);

  if (!isAdmin && !canAccessAsCustomer) {
    return new NextResponse("No autorizado.", { status: 403 });
  }

  return new NextResponse(quote.proposalHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
