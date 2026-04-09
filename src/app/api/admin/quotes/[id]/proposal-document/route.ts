import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/permissions/policies";
import { ensureQuoteProposalDocumentRecord } from "@/features/documents/server/document-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();

  if (!session?.user.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const document = await ensureQuoteProposalDocumentRecord(id, session.user.id);

  if (!document) {
    return NextResponse.json({ message: "La cotizacion no tiene propuesta lista para publicar." }, { status: 404 });
  }

  return NextResponse.json({ document });
}
