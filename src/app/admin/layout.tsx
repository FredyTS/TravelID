import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getServerAuthSession } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/permissions/policies";

const adminNav = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/conversations", label: "Conversaciones" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/inquiries", label: "Solicitudes" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/quotes", label: "Cotizaciones" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/payments", label: "Pagos" },
  { href: "/admin/packages", label: "Paquetes" },
  { href: "/admin/suppliers", label: "Proveedores" },
  { href: "/admin/meal-plans", label: "Planes" },
  { href: "/admin/destinations", label: "Destinos" },
  { href: "/admin/hotels", label: "Hoteles" },
  { href: "/admin/promotions", label: "Promociones" },
  { href: "/admin/activity", label: "Actividad" },
  { href: "/admin/settings", label: "Configuracion" },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  if (!session?.user || !isAdminRole(session.user.role)) {
    redirect("/admin-acceso");
  }

  return (
    <DashboardShell
      nav={adminNav}
      title="Panel admin"
      subtitle="Ventas, clientes, pedidos, conversaciones, documentos y cobranza desde un solo lugar."
    >
      {children}
    </DashboardShell>
  );
}
