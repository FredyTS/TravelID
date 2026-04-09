export default async function PortalTripDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Detalle del viaje</h1>
      <p className="text-slate-600">
        Vista del pedido ` {orderId} ` con resumen, pagos, documentos, itinerario y travel updates.
      </p>
    </div>
  );
}
