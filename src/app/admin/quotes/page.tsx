import Link from "next/link";
import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminQuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl text-white">Cotizaciones</h1>
        <Link href="/admin/quotes/new" className="text-sm font-medium text-cyan-300">
          Nueva cotizacion
        </Link>
      </div>
      <PlaceholderTable
        columns={["Quote", "Cliente", "Estado", "Total"]}
        rows={[
          ["Q-2026-001", "Maria Rojas", "SENT", "$12,990 MXN"],
          ["Q-2026-002", "Grupo Delta", "DRAFT", "$48,500 MXN"],
        ]}
      />
    </div>
  );
}
