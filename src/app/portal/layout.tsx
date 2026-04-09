import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getServerAuthSession } from "@/lib/auth/session";

const portalNav = [
  { href: "/portal", label: "Resumen" },
  { href: "/portal/viajes", label: "Viajes" },
  { href: "/portal/inbox", label: "Inbox" },
  { href: "/portal/documentos", label: "Documentos" },
  { href: "/portal/pagos", label: "Pagos" },
  { href: "/portal/perfil", label: "Perfil" },
];

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user?.customerId) {
    redirect("/acceso");
  }

  return (
    <DashboardShell
      nav={portalNav}
      title="Portal del cliente"
      subtitle="Consulta tu viaje, paga tu saldo, descarga documentos y escribe directamente al admin."
    >
      {children}
    </DashboardShell>
  );
}
