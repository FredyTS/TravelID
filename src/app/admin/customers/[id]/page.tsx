export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Ficha de cliente</h1>
      <p className="text-slate-600">
        Vista placeholder para customer ` {id} ` con historial, viajes, travelers y documentos.
      </p>
    </div>
  );
}
