import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: {
      user: true,
    },
  });

  return (
    <div className="surface space-y-6 p-8 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Clientes</h1>
          <p className="mt-2 text-slate-600">Base central de clientes, frecuentes, contactos y cuentas con acceso al portal.</p>
        </div>
      </div>
      <div className="grid gap-3">
        {customers.length > 0 ? (
          customers.map((customer) => (
            <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 hover:border-primary">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-950">
                    {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.companyName || "Cliente"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{customer.email ?? "Sin email registrado"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {customer.user ? (
                    <Badge className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                      Portal activo
                    </Badge>
                  ) : null}
                  <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {customer.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Todavia no hay clientes registrados.
          </div>
        )}
      </div>
    </div>
  );
}
