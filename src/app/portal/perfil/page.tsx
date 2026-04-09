import { requireCustomerSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const session = await requireCustomerSession();

  const customer = session?.user.customerId
    ? await prisma.customer.findUnique({
        where: { id: session.user.customerId },
        include: {
          travelerProfiles: true,
        },
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="surface p-8 text-slate-900">
        <h1 className="text-4xl">Perfil</h1>
        <p className="mt-2 text-slate-600">Estos datos se usan para identificar tus reservaciones y mantener el seguimiento de tus viajes.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface p-8 text-slate-900">
          <h2 className="text-2xl">Datos de contacto</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">Nombre</p>
              <p className="mt-1 font-medium text-slate-950">
                {[customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "Sin nombre registrado"}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">Email</p>
              <p className="mt-1 font-medium text-slate-950">{customer?.email ?? "Sin email"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">Telefono</p>
              <p className="mt-1 font-medium text-slate-950">{customer?.phone ?? "Sin telefono"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-slate-500">WhatsApp</p>
              <p className="mt-1 font-medium text-slate-950">{customer?.whatsapp ?? "Sin dato registrado"}</p>
            </div>
          </div>
        </div>

        <div className="surface p-8 text-slate-900">
          <h2 className="text-2xl">Viajeros registrados</h2>
          <div className="mt-5 grid gap-3">
            {customer?.travelerProfiles.length ? (
              customer.travelerProfiles.map((traveler) => (
                <div key={traveler.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                  <p className="font-medium text-slate-950">
                    {traveler.firstName} {traveler.lastName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {traveler.nationality ?? "Sin nacionalidad"} · {traveler.passportNumber ?? "Sin pasaporte"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Todavia no hay perfiles de viajero cargados para tu cuenta.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
