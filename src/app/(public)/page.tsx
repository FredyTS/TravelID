import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CreditCard, HeartHandshake, MapPinned, ShieldCheck } from "lucide-react";
import { getFeaturedPackages, getPromotions } from "@/features/catalog/server/catalog-service";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pillars = [
  {
    icon: MapPinned,
    title: "Paquetes listos para reservar",
    description: "Cuando el paquete coincide con los viajeros incluidos, puedes apartarlo sin pasar por cotizacion.",
  },
  {
    icon: HeartHandshake,
    title: "Cotizacion personalizada",
    description: "Si cambian fechas, origen o numero de viajeros, preparamos una propuesta a medida.",
  },
  {
    icon: CreditCard,
    title: "Reserva con anticipo",
    description: "Separa tu viaje con anticipo o liquida el total con una experiencia de pago simple y segura.",
  },
  {
    icon: ShieldCheck,
    title: "Seguimiento antes del viaje",
    description: "Consulta documentos, itinerario y actualizaciones en un solo lugar antes de salir.",
  },
];

export default async function HomePage() {
  const [featuredPackages, currentPromotions] = await Promise.all([
    getFeaturedPackages(),
    getPromotions(),
  ]);

  const heroPackage = featuredPackages[0];

  return (
    <div className="pb-16">
      <section className="container-shell pt-14 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-primary hover:bg-primary/10">
              Paquetes destacados, promociones y viajes a medida
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-tight md:text-7xl">
                Descubre playas, escapadas y experiencias memorables con Alondra Travel MX.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600 md:text-xl">
                Encuentra tu proximo paquete vacacional, reserva de inmediato cuando el paquete encaje contigo o solicita una cotizacion personalizada si necesitas ajustar condiciones.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/paquetes">
                  Ver paquetes
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/cotizar">Cotiza tu viaje</Link>
              </Button>
            </div>
            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
                <p className="text-sm text-slate-500">Destinos destacados</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">12+</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
                <p className="text-sm text-slate-500">Promociones activas</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{currentPromotions.length}</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/70 p-4">
                <p className="text-sm text-slate-500">Desde</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">$12,990</p>
              </div>
            </div>
          </div>

          <div className="relative grid gap-4">
            {heroPackage ? (
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.3)]">
                <Image
                  src={heroPackage.heroImage}
                  alt={heroPackage.name}
                  width={1200}
                  height={900}
                  className="h-[460px] w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                    Reserva directa disponible
                  </p>
                  <h2 className="mt-3 text-3xl text-white">{heroPackage.name}</h2>
                  <p className="mt-2 max-w-lg text-sm text-white/85">{heroPackage.summary}</p>
                  <p className="mt-3 text-sm font-medium text-white/90">
                    Precio para {heroPackage.includedTravelers}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <Card key={pillar.title} className="border-slate-200/80 bg-white/85 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <span className="rounded-2xl bg-primary/10 p-2 text-primary">
                        <pillar.icon className="size-5" />
                      </span>
                      {pillar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-600">{pillar.description}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-20 space-y-8">
        <SectionHeading
          eyebrow="Escapadas destacadas"
          title="Paquetes destacados"
          description="Cada paquete indica para cuántos adultos y menores aplica el precio mostrado y si puedes reservarlo tal cual."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredPackages.map((travelPackage) => (
            <Card
              key={travelPackage.id}
              className="overflow-hidden border-0 bg-white/88 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)]"
            >
              <div className="relative h-64">
                <Image src={travelPackage.heroImage} alt={travelPackage.name} fill className="object-cover" />
              </div>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{travelPackage.destination}</Badge>
                  <Badge variant="secondary">{travelPackage.travelType}</Badge>
                  <Badge variant="secondary">{travelPackage.includedTravelers}</Badge>
                </div>
                <CardTitle>{travelPackage.name}</CardTitle>
                <p className="text-sm text-slate-600">{travelPackage.summary}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Desde</p>
                    <p className="text-3xl font-semibold text-slate-950">
                      ${travelPackage.priceFrom.toLocaleString("es-MX")} MXN
                    </p>
                  </div>
                  <Badge>{travelPackage.duration}</Badge>
                </div>
                <p className="text-sm text-slate-500">{travelPackage.reservationNote}</p>
                <div className="grid gap-3">
                  <Button asChild className="w-full">
                    <Link href={`/paquetes/${travelPackage.slug}`}>Ver detalle</Link>
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
      </section>

      <section className="container-shell mt-20">
        <div className="surface grid gap-8 p-8 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Promociones"
            title="Promociones para reservar en el mejor momento"
            description="Ofertas pensadas para mover reservas con descuentos, anticipos accesibles y vigencias claras."
          />
          <div className="grid gap-4">
            {currentPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl">{promotion.title}</h3>
                  <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">
                    {promotion.discountLabel}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-600">{promotion.description}</p>
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Vigencia: {promotion.validUntil}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <SectionHeading
            eyebrow="Atencion personalizada"
            title="¿El paquete no encaja exactamente contigo?"
            description="Si cambian viajeros, edades, fechas, ciudad de salida o servicios incluidos, armamos una cotizacion personalizada."
          />
          <div className="surface p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Reserva directa</p>
                <h3 className="mt-2 text-xl">Cuando te funciona tal cual</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Si el paquete y el numero de viajeros coinciden con lo publicado, puedes reservar de inmediato.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Cotizacion</p>
                <h3 className="mt-2 text-xl">Cuando necesitas cambios</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ajustamos fechas, ocupacion, origen, hotel o extras para proponerte una opcion personalizada.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/cotizar">Solicitar propuesta</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contacto">Hablar por WhatsApp o correo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
