import { getCatalogPackages } from "@/features/catalog/server/catalog-service";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { DirectReservationForm } from "@/features/orders/components/direct-reservation-form";

export default async function ReservePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedPackage = typeof params.package === "string" ? params.package : "";
  const packages = await getCatalogPackages();
  const currentPackage = packages.find((item) => item.slug === selectedPackage);

  return (
    <div className="container-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr]">
        <SectionHeading
          eyebrow="Reserva directa"
          title="Reserva el paquete tal como esta publicado"
          description="Este flujo aplica cuando el precio y las condiciones del paquete si encajan con tus viajeros. Si necesitas cambios, te conviene cotizacion personalizada."
        />
        <Card className="surface border-0">
          <CardContent className="p-7">
            {currentPackage ? (
              <DirectReservationForm
                packageName={currentPackage.name}
                includedTravelers={currentPackage.includedTravelers}
                packageSlug={currentPackage.slug}
              />
            ) : (
              <p className="text-sm text-slate-600">
                Selecciona un paquete valido desde el catalogo para iniciar la reserva.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
