import { PlaceholderTable } from "@/components/shared/placeholder-table";

export default function AdminInquiriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl text-white">Inquiries</h1>
      <PlaceholderTable
        columns={["Canal", "Destino", "Viajeros", "Estado"]}
        rows={[
          ["Formulario", "Cancun", "2 adultos", "ASSIGNED"],
          ["Manual", "Riviera Maya", "2 adultos / 2 menores", "IN_PROGRESS"],
        ]}
      />
    </div>
  );
}
