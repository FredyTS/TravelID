export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Detalle de cotizacion</h1>
      <p className="text-slate-600">
        Quote ` {id} ` con snapshot comercial, notas internas, notas visibles y conversion a pedido.
      </p>
    </div>
  );
}
