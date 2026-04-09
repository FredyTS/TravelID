import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const quote = await prisma.quote.findFirst({
    where: { shareToken: token },
    select: {
      proposalHtml: true,
    },
  });

  if (!quote?.proposalHtml) {
    return new NextResponse("La cotización compartida no está disponible.", { status: 404 });
  }

  return new NextResponse(quote.proposalHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
