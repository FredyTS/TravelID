export default async function PortalQuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;

  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Cotizacion privada</h1>
      <p className="text-slate-600">
        Resumen de quote ` {quoteId} ` con vigencia, desglose, pagos permitidos y aprobacion del cliente.
      </p>
    </div>
  );
}
