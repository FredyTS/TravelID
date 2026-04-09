import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth/session";
import { canAccessCustomerResource, isAdminRole } from "@/lib/permissions/policies";
import {
  generateQuoteProposalPdfBytes,
  getQuoteForProposalDocument,
  parseGeneratedQuoteProposalStorageKey,
} from "@/features/documents/server/document-service";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  const { id } = await params;

  if (!session?.user.id) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      customer: true,
      order: {
        select: {
          customerId: true,
        },
      },
      quote: {
        select: {
          customerId: true,
        },
      },
    },
  });

  if (!document) {
    return new NextResponse("Documento no encontrado.", { status: 404 });
  }

  const isAdmin = isAdminRole(session.user.role);
  const ownerCustomerId = document.customerId ?? document.order?.customerId ?? document.quote?.customerId ?? null;
  const canAccessAsCustomer =
    document.visibility === "CLIENT" && canAccessCustomerResource(session.user.customerId, ownerCustomerId);

  if (!isAdmin && !canAccessAsCustomer) {
    return new NextResponse("No autorizado.", { status: 403 });
  }

  const generatedQuoteId = parseGeneratedQuoteProposalStorageKey(document.storageKey);

  if (!generatedQuoteId) {
    return new NextResponse("El documento aun no tiene un origen descargable configurado.", { status: 501 });
  }

  const quote = await getQuoteForProposalDocument(generatedQuoteId);

  if (!quote?.proposalData) {
    return new NextResponse("La propuesta asociada ya no esta disponible.", { status: 404 });
  }

  const pdfBytes = await generateQuoteProposalPdfBytes(quote);

  await prisma.document.update({
    where: { id: document.id },
    data: {
      sizeBytes: pdfBytes.length,
    },
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${document.fileName}"`,
    },
  });
}
