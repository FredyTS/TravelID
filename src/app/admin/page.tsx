import { adminStats } from "@/lib/constants/mock-data";
import { StatCard } from "@/components/shared/stat-card";
import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl text-white">Dashboard operativo</h1>
        <p className="mt-2 text-slate-300">
          Vista central para revisar ventas, seguimiento comercial, cobranza y pedidos en curso.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <PlaceholderTable
        columns={["Entidad", "Estado", "Canal", "Siguiente paso"]}
        rows={[
          ["Lead / Verano Caribe", "CONTACTED", "Formulario", "Enviar cotizacion personalizada"],
          ["Quote / Cancun", "SENT", "Catalogo", "Validar anticipo"],
          ["Order / Riviera Maya", "PARTIALLY_PAID", "Manual", "Subir voucher"],
        ]}
      />
    </div>
  );
}
