import Image from "next/image";
import Link from "next/link";
import { getCatalogPackages } from "@/features/catalog/server/catalog-service";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : undefined;
  const destination = typeof params.destination === "string" ? params.destination : undefined;
  const travelType = typeof params.travelType === "string" ? params.travelType : undefined;

  const packages = await getCatalogPackages({ q, destination, travelType });

  return (
    <div className="container-shell py-14">
      <SectionHeading
        eyebrow="Catalogo"
        title="Paquetes vacacionales"
        description="Explora destinos recomendados, compara estilos de viaje y reserva de inmediato cuando el paquete aplique tal cual para tus viajeros."
      />

      <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
        <Badge variant="secondary">Destino: {destination ?? "Todos"}</Badge>
        <Badge variant="secondary">Tipo: {travelType ?? "Todos"}</Badge>
        <Badge variant="secondary">Busqueda: {q ?? "Sin filtro"}</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {packages.map((travelPackage) => (
          <Card
            key={travelPackage.id}
            className="overflow-hidden border-0 bg-white/88 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]"
          >
            <div className="relative h-64">
              <Image
                src={travelPackage.heroImage}
                alt={travelPackage.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{travelPackage.name}</CardTitle>
              <p className="text-sm text-slate-500">
                {travelPackage.destination} · {travelPackage.location}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{travelPackage.summary}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{travelPackage.includedTravelers}</Badge>
                {travelPackage.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">
                  ${travelPackage.priceFrom.toLocaleString("es-MX")} MXN
                </span>
                <Badge>{travelPackage.travelType}</Badge>
              </div>
              <p className="text-sm text-slate-500">{travelPackage.reservationNote}</p>
              <div className="grid gap-3">
                <Button asChild className="w-full">
                  <Link href={`/paquetes/${travelPackage.slug}`}>Abrir paquete</Link>
                </Button>
                {travelPackage.directBookable ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/reservar?package=${travelPackage.slug}`}>Reservar tal cual</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
