import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminLeadsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl text-slate-950">Leads</h1>
      <PlaceholderTable
        columns={["Lead", "Fuente", "Estado", "Seguimiento"]}
        rows={[
          ["Maria Rojas", "Formulario web", "NEW", "Responder hoy"],
          ["Carlos Vega", "WhatsApp", "QUALIFIED", "Enviar propuesta"],
        ]}
      />
    </div>
  );
}
