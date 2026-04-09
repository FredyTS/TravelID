import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackageBySlug } from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const travelPackage = await getPackageBySlug(slug);

  if (!travelPackage) {
    notFound();
  }

  return (
    <div className="container-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.3)]">
            <Image
              src={travelPackage.heroImage}
              alt={travelPackage.name}
              width={1400}
              height={960}
              className="h-[420px] w-full object-cover"
              priority
            />
          </div>

          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
            {travelPackage.destination} · {travelPackage.location}
          </Badge>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl">{travelPackage.name}</h1>
            <p className="max-w-3xl text-lg text-slate-600">{travelPackage.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {travelPackage.gallery.map((image, index) => (
              <div key={image} className="relative overflow-hidden rounded-[1.5rem]">
                <Image
                  src={image}
                  alt={`${travelPackage.name} ${index + 1}`}
                  width={900}
                  height={700}
                  className="h-44 w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="surface p-6">
            <h2 className="text-2xl">Lo mejor de este viaje</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <li>Precio publicado para {travelPackage.includedTravelers}</li>
              <li>Reserva directa si estas condiciones te funcionan</li>
              <li>Cotizacion personalizada si cambian viajeros o fechas</li>
              <li>Seguimiento de documentos previos al viaje</li>
              <li>Actualizaciones y detalles del itinerario</li>
              <li>Consulta de pagos y comprobantes</li>
            </ul>
          </div>
        </div>

        <Card className="surface border-0">
          <CardContent className="space-y-6 p-7">
            <div>
              <p className="text-sm text-slate-500">Precio desde</p>
              <p className="mt-1 text-4xl font-semibold text-slate-950">
                ${travelPackage.priceFrom.toLocaleString("es-MX")} MXN
              </p>
              <p className="mt-2 text-sm text-slate-500">Aplicable para {travelPackage.includedTravelers}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{travelPackage.duration}</Badge>
              <Badge variant="secondary">{travelPackage.travelType}</Badge>
              <Badge variant="secondary">{travelPackage.highlight}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {travelPackage.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {travelPackage.reservationNote}
            </div>
            <div className="space-y-3">
              {travelPackage.directBookable ? (
                <Button asChild className="w-full">
                  <Link href={`/reservar?package=${travelPackage.slug}`}>Reservar este paquete</Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className="w-full">
                <Link href={`/cotizar?package=${travelPackage.slug}`}>Solicitar cotizacion personalizada</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/contacto">Hablar con administracion</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
