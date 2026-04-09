import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, CalendarDays, MapPinned, Sparkles } from "lucide-react";
import { getFeaturedPackages, getPromotions } from "@/features/catalog/server/catalog-service";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const [featuredPackages, currentPromotions] = await Promise.all([
    getFeaturedPackages(),
    getPromotions(),
  ]);

  const heroPackage = featuredPackages[0];

  return (
    <div className="pb-20">
      <section className="container-shell pt-8 md:pt-14">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_40%),linear-gradient(135deg,#ffffff_0%,#eff8ff_38%,#f8fafc_100%)] p-5 shadow-[0_32px_90px_-40px_rgba(15,23,42,0.45)] sm:p-7 md:p-10">
            <Badge className="rounded-full bg-sky-100 px-4 py-1.5 text-sky-800 hover:bg-sky-100">
              Paquetes, promociones y cotizaciones personalizadas
            </Badge>
            <div className="mt-6 space-y-5">
              <h1 className="max-w-4xl text-4xl leading-tight text-slate-950 sm:text-5xl md:text-7xl">
                Viajes listos para inspirarte, apartar y planear con confianza.
              </h1>
              <p className="max-w-2xl text-base text-slate-600 sm:text-lg md:text-xl">
                Descubre paquetes con salida definida, precios publicados y promociones vigentes. Si necesitas otra ciudad de salida, fechas distintas o una combinación especial, te preparamos una cotización personalizada.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/paquetes">
                  Explorar paquetes
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/promociones">Ver promociones</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto">
                <Link href="/cotizar">Solicitar cotización</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5">
                <p className="text-sm text-slate-500">Paquetes destacados</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{featuredPackages.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5">
                <p className="text-sm text-slate-500">Promociones activas</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{currentPromotions.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5">
                <p className="text-sm text-slate-500">Aparta desde</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">25%</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {heroPackage ? (
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_32px_90px_-40px_rgba(15,23,42,0.55)]">
                <Image
                  src={heroPackage.heroImage}
                  alt={heroPackage.name}
                  width={1200}
                  height={920}
                  className="h-[320px] w-full object-cover sm:h-[380px] lg:h-[430px]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/15 text-white hover:bg-white/15">{heroPackage.destination}</Badge>
                    <Badge className="bg-white/15 text-white hover:bg-white/15">Salida desde {heroPackage.departureCity}</Badge>
                  </div>
                  <h2 className="mt-4 text-2xl text-white sm:text-3xl">{heroPackage.name}</h2>
                  <p className="mt-2 max-w-lg text-sm text-white/85">{heroPackage.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
                    <span>Precio para {heroPackage.includedTravelers}</span>
                    <span>{heroPackage.duration}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-slate-200/80 bg-white/90 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <span className="rounded-2xl bg-sky-100 p-2 text-sky-700">
                      <MapPinned className="size-5" />
                    </span>
                    Paquetes con ciudad de salida
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  El precio publicado se muestra con la ciudad de salida incluida para que sepas cuándo puedes apartarlo de inmediato.
                </CardContent>
              </Card>
              <Card className="border-slate-200/80 bg-white/90 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <span className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                      <BadgePercent className="size-5" />
                    </span>
                    Promociones activas
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  Descuentos, campañas y condiciones comerciales para reservar en el mejor momento.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-20 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Paquetes"
            title="Paquetes listos para reservar o cotizar"
            description="Compara destinos, revisa desde qué ciudad sale cada propuesta y elige si te conviene apartar con el precio publicado o pedir un ajuste personalizado."
          />
          <Button asChild variant="outline">
            <Link href="/paquetes">Ver todo el catálogo</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredPackages.map((travelPackage) => (
            <Card
              key={travelPackage.id}
              className="overflow-hidden rounded-[2rem] border-0 bg-white shadow-[0_28px_80px_-38px_rgba(15,23,42,0.42)]"
            >
              <div className="relative h-56 sm:h-64">
                <Image src={travelPackage.heroImage} alt={travelPackage.name} fill className="object-cover" />
              </div>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{travelPackage.destination}</Badge>
                  <Badge variant="secondary">Salida desde {travelPackage.departureCity}</Badge>
                  <Badge variant="secondary">{travelPackage.includedTravelers}</Badge>
                </div>
                <CardTitle>{travelPackage.name}</CardTitle>
                <p className="text-sm text-slate-600">{travelPackage.summary}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Duración</span>
                    <span className="font-medium text-slate-950">{travelPackage.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tipo</span>
                    <span className="font-medium text-slate-950">{travelPackage.travelType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Precio desde</span>
                    <span className="text-xl font-semibold text-slate-950">
                      ${travelPackage.priceFrom.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">{travelPackage.reservationNote}</p>
                <div className="grid gap-3">
                  <Button asChild className="w-full">
                    <Link href={`/paquetes/${travelPackage.slug}`}>Ver paquete completo</Link>
                  </Button>
                  {travelPackage.directBookable ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/reservar?package=${travelPackage.slug}`}>Reserva inmediata</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-shell mt-20">
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#082f49_0%,#0f766e_100%)] p-8 text-white shadow-[0_32px_90px_-40px_rgba(8,47,73,0.8)]">
            <Badge className="bg-white/15 text-white hover:bg-white/15">Promociones</Badge>
            <h2 className="mt-5 text-3xl text-white sm:text-4xl">Aprovecha campañas vigentes antes de que cambien las tarifas.</h2>
            <p className="mt-4 max-w-xl text-white/80">
              Encuentra descuentos por temporada, campañas de anticipo y oportunidades para apartar tu viaje con mejores condiciones.
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/promociones">Explorar promociones</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full text-white hover:bg-white/10 hover:text-white sm:w-auto">
                <Link href="/cotizar">Quiero una propuesta</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {currentPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_22px_70px_-42px_rgba(15,23,42,0.35)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Aplicable en {promotion.appliesToLabel}</p>
                    <h3 className="mt-2 text-2xl text-slate-950">{promotion.title}</h3>
                  </div>
                  <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">{promotion.discountLabel}</Badge>
                </div>
                <p className="mt-4 text-sm text-slate-600">{promotion.description}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                  <span>Vigencia: {promotion.validUntil}</span>
                  <Link href={`/promociones/${promotion.slug}`} className="font-medium text-primary hover:underline">
                    Ver detalle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-20">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.28)]">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Cotización personalizada</Badge>
            <h2 className="mt-5 text-3xl text-slate-950 sm:text-4xl">¿Quieres cambiar ciudad de salida, fechas o viajeros?</h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              Cuando el paquete publicado no coincide exactamente con lo que buscas, armamos una propuesta con la ocupación, ciudad de salida, fechas y servicios que sí te funcionan.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <MapPinned className="size-5 text-sky-700" />
                <p className="mt-3 font-medium text-slate-950">Otra ciudad de salida</p>
                <p className="mt-2 text-sm text-slate-600">Si no sales desde la ciudad publicada, recalculamos la propuesta.</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <CalendarDays className="size-5 text-emerald-700" />
                <p className="mt-3 font-medium text-slate-950">Fechas distintas</p>
                <p className="mt-2 text-sm text-slate-600">Ajustamos disponibilidad, vigencia y condiciones comerciales.</p>
              </div>
              <div className="rounded-[1.5rem] bg-slate-50 p-5">
                <Sparkles className="size-5 text-amber-700" />
                <p className="mt-3 font-medium text-slate-950">Viaje a medida</p>
                <p className="mt-2 text-sm text-slate-600">Hotel, traslados, vuelos y extras según tu perfil de viaje.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/cotizar">Solicitar cotización</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/contacto">Hablar por WhatsApp o correo</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {featuredPackages.slice(0, 2).map((travelPackage) => (
              <Card key={travelPackage.id} className="rounded-[1.75rem] border-slate-200 bg-white shadow-none">
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{travelPackage.destination}</Badge>
                    <Badge variant="secondary">Salida desde {travelPackage.departureCity}</Badge>
                  </div>
                  <CardTitle className="mt-2">{travelPackage.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  <p>{travelPackage.highlight}</p>
                  <p className="mt-3">{travelPackage.reservationNote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
