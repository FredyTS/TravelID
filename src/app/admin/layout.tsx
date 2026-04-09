import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getServerAuthSession } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/permissions/policies";

const adminNav = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/quotes", label: "Cotizaciones" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/packages", label: "Catalogo" },
  { href: "/admin/activity", label: "Actividad" },
  { href: "/admin/settings", label: "Settings" },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user || !isAdminRole(session.user.role)) {
    redirect("/login");
  }

  return (
    <DashboardShell
      nav={adminNav}
      title="Panel de administracion"
      subtitle="Control central de catalogo, cotizaciones, pedidos, pagos y documentos."
    >
      {children}
    </DashboardShell>
  );
}
