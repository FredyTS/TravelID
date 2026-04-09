import { NextResponse } from "next/server";
import {
  generateQuoteProposalPdfBytes,
  getQuoteProposalFileName,
} from "@/features/documents/server/document-service";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const quote = await prisma.quote.findFirst({
    where: { shareToken: token },
    include: {
      customer: true,
      documents: true,
    },
  });

  if (!quote?.proposalData) {
    return new NextResponse("La cotización compartida no tiene propuesta.", { status: 404 });
  }

  const pdfBytes = await generateQuoteProposalPdfBytes(quote);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${getQuoteProposalFileName(quote)}"`,
    },
  });
}
