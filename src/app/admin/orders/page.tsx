import Link from "next/link";
import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl text-white">Pedidos</h1>
          <p className="mt-2 text-slate-300">
            Seguimiento central de reservas confirmadas, pagos, documentos y entrega final.
          </p>
        </div>
        <Link href="/admin/orders/ORD-2026-001" className="text-sm font-medium text-cyan-300">
          Abrir pedido ejemplo
        </Link>
      </div>
      <PlaceholderTable
        columns={["Pedido", "Cliente", "Estado", "Saldo"]}
        rows={[
          ["ORD-2026-001", "Maria Rojas", "AWAITING_DEPOSIT", "$9,490 MXN"],
          ["ORD-2026-002", "Grupo Delta", "PAID", "$0 MXN"],
        ]}
      />
    </div>
  );
}
