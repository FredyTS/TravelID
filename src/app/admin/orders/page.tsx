import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl text-white">Pedidos</h1>
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
