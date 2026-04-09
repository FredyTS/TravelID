import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function SharedInquiryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const inquiry = await prisma.inquiry.findFirst({
    where: { shareToken: token },
    include: {
      package: true,
      lead: true,
      customer: true,
    },
  });

  if (!inquiry) {
    notFound();
  }

  const contactName =
    inquiry.customer?.firstName ??
    inquiry.lead?.firstName ??
    "Tu solicitud";

  return (
    <div className="container-shell py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="surface p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Seguimiento de solicitud</p>
          <h1 className="mt-3 text-4xl text-slate-950">{contactName}</h1>
          <p className="mt-2 text-slate-600">Solicitud registrada el {inquiry.createdAt.toLocaleDateString("es-MX")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Estado</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{inquiry.status}</p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Destino o paquete base</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {inquiry.package?.name ?? "Cotización personalizada"}
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Ocupación</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {inquiry.adults} adultos · {inquiry.minors} menores
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h2 className="text-2xl text-slate-950">¿Qué sigue?</h2>
          <p className="mt-4 text-sm text-slate-600">
            Ya registramos tu solicitud. Cuando la propuesta esté lista te mandaremos tu cotización y también podrás verla desde el portal.
          </p>
          {inquiry.notes ? (
            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-950">Resumen de tu solicitud</p>
              <p className="mt-2 text-sm text-slate-600">{inquiry.notes}</p>
            </div>
          ) : null}
          <Link href="/acceso" className="mt-6 inline-flex text-sm font-medium text-primary hover:underline">
            Entrar al portal
          </Link>
        </div>
      </div>
    </div>
  );
}
