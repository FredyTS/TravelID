import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth/session";
import { canAccessCustomerResource, isAdminRole } from "@/lib/permissions/policies";
import {
  generateQuoteProposalPdfBytes,
  getQuoteForProposalDocument,
  getQuoteProposalFileName,
} from "@/features/documents/server/document-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  const { id } = await params;

  if (!session?.user.id) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  const quote = await getQuoteForProposalDocument(id);

  if (!quote?.proposalData) {
    return new NextResponse("La cotizacion no tiene una propuesta generada.", { status: 404 });
  }

  const isAdmin = isAdminRole(session.user.role);
  const canAccessAsCustomer = canAccessCustomerResource(session.user.customerId, quote.customerId);

  if (!isAdmin && !canAccessAsCustomer) {
    return new NextResponse("No autorizado.", { status: 403 });
  }

  const pdfBytes = await generateQuoteProposalPdfBytes(quote);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${getQuoteProposalFileName(quote)}"`,
    },
  });
}
