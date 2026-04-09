import Link from "next/link";
import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl text-white">Clientes</h1>
        <Link href="/admin/customers/demo" className="text-sm font-medium text-cyan-300">
          Ver ficha ejemplo
        </Link>
      </div>
      <PlaceholderTable
        columns={["Cliente", "Origen", "Estado", "Ultima accion"]}
        rows={[
          ["Maria Rojas", "Web", "ACTIVE", "Pago pendiente"],
          ["Grupo Delta", "Manual", "VIP", "Documentos enviados"],
        ]}
      />
    </div>
  );
}
