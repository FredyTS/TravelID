export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Detalle de pedido</h1>
      <p className="text-slate-600">
        Pedido ` {id} ` con items, bookings, pagos, documentos y timeline de actividad.
      </p>
    </div>
  );
}
