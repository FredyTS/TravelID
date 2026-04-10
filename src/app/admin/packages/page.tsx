import Link from "next/link";
import { togglePackageFlagAction } from "@/features/catalog/server/admin-catalog-actions";
import { AdminPackageForm } from "@/features/catalog/components/admin-package-form";
import {
  getAdminCatalogOverview,
  getAdminPackageById,
  getDestinationOptions,
  getHotelOptions,
  getMealPlanOptions,
  getSupplierOptions,
  getHotelRoomTypeOptions,
} from "@/features/catalog/server/catalog-service";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [{ packages }, destinations, hotels, suppliers, mealPlans, roomTypes, currentPackage] = await Promise.all([
    getAdminCatalogOverview(),
    getDestinationOptions(),
    getHotelOptions(),
    getSupplierOptions(),
    getMealPlanOptions(),
    getHotelRoomTypeOptions(),
    editId ? getAdminPackageById(editId) : Promise.resolve(null),
  ]);

  const packageFormValues = {
    id: currentPackage?.id ?? "",
    name: currentPackage?.name ?? "",
    slug: currentPackage?.slug ?? "",
    travelType: currentPackage?.travelType ?? "BEACH",
    destinationId: currentPackage?.destinationId ?? destinations[0]?.id ?? "",
    hotelId: currentPackage?.hotelId ?? "",
    supplierId: currentPackage?.supplierId ?? "",
    locationLabel: currentPackage?.locationLabel ?? "",
    departureCity: currentPackage?.departureCity ?? "",
    mealPlanId: currentPackage?.mealPlanId ?? "",
    defaultRoomTypeId: currentPackage?.defaultRoomTypeId ?? "",
    summary: currentPackage?.summary ?? "",
    description: currentPackage?.description ?? "",
    priceBasis: currentPackage?.priceBasis ?? "",
    bookingConditionsSummary: currentPackage?.bookingConditionsSummary ?? "",
    heroImageUrl: currentPackage?.heroImageUrl ?? "",
    highlight: currentPackage?.highlight ?? "",
    galleryUrls: Array.isArray(currentPackage?.galleryUrls) ? currentPackage.galleryUrls.join(", ") : "",
    marketingTags: Array.isArray(currentPackage?.marketingTags) ? currentPackage.marketingTags.join(", ") : "",
    durationDays: currentPackage?.durationDays ?? 5,
    durationNights: currentPackage?.durationNights ?? 4,
    basePriceFrom: Number(currentPackage?.basePriceFrom ?? 0),
    includedAdults: currentPackage?.includedAdults ?? 2,
    includedMinors: currentPackage?.includedMinors ?? 0,
    minTravelers: currentPackage?.minTravelers ?? 1,
    reservationNote: currentPackage?.reservationNote ?? "",
    directBookable: currentPackage?.directBookable ?? false,
    featured: currentPackage?.featured ?? false,
    isActive: currentPackage ? currentPackage.isActive : true,
    components:
      currentPackage?.components.map((component) => {
        const metadata =
          component.metadata && typeof component.metadata === "object" && !Array.isArray(component.metadata)
            ? (component.metadata as Record<string, unknown>)
            : {};

        return {
          type: component.type,
          title: component.title,
          description: component.description ?? "",
          quantity: Number(metadata.quantity ?? 1),
          unitPrice: Number(metadata.unitPrice ?? 0),
          currency: String(metadata.currency ?? "MXN"),
          isIncluded: component.isIncluded,
          supplierId: component.supplierId ?? "",
          hotelId: component.hotelId ?? "",
          roomTypeId: component.roomTypeId ?? "",
          mealPlanId: component.mealPlanId ?? "",
          originCity: component.originCity ?? "",
          destinationCity: component.destinationCity ?? "",
          pricingReference: component.pricingReference ?? "",
          notes: String(metadata.notes ?? ""),
        };
      }) ?? [],
  };

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Producto comercial</p>
            <h1 className="mt-3 text-4xl">Paquetes</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Captura la informacion de venta que alimenta la home, el catalogo, la reserva inmediata y las cotizaciones.
            </p>
          </div>
          <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100">
            {packages.length} paquetes en sistema
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{currentPackage ? "Editar paquete" : "Nuevo paquete"}</CardTitle>
            {currentPackage ? (
              <Button asChild variant="ghost">
                <Link href="/admin/packages">Limpiar</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <AdminPackageForm
              currentPackageId={currentPackage?.id}
              values={packageFormValues}
              destinations={destinations.map((destination) => ({
                id: destination.id,
                label: destination.name,
              }))}
              hotels={hotels.map((hotel) => ({
                id: hotel.id,
                label: `${hotel.name} · ${hotel.destination.name}`,
              }))}
              suppliers={suppliers.map((supplier) => ({
                id: supplier.id,
                label: `${supplier.displayName ?? supplier.name}${supplier.code ? ` · ${supplier.code}` : ""}`,
              }))}
              mealPlans={mealPlans.map((mealPlan) => ({
                id: mealPlan.id,
                label: mealPlan.name,
              }))}
              roomTypes={roomTypes.map((roomType) => ({
                id: roomType.id,
                label: `${roomType.name} · ${roomType.hotel.name}`,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Paquetes cargados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Paquete</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((travelPackage) => (
                    <TableRow key={travelPackage.id} className="border-slate-200">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{travelPackage.name}</p>
                          <p className="text-xs text-slate-500">/{travelPackage.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{travelPackage.destination.name}</TableCell>
                      <TableCell className="text-slate-600">
                        {travelPackage.basePriceFrom ? formatCurrency(Number(travelPackage.basePriceFrom)) : "Por definir"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={
                              travelPackage.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            }
                          >
                            {travelPackage.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          {travelPackage.featured ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Destacado</Badge>
                          ) : null}
                          {travelPackage.directBookable ? (
                            <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">Reserva inmediata</Badge>
                          ) : null}
                          {travelPackage.supplier ? (
                            <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">
                              {travelPackage.supplier.displayName ?? travelPackage.supplier.name}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/packages?edit=${travelPackage.id}`}>Editar</Link>
                          </Button>
                          <form action={togglePackageFlagAction}>
                            <input type="hidden" name="id" value={travelPackage.id} />
                            <input type="hidden" name="field" value="featured" />
                            <input type="hidden" name="current" value={String(travelPackage.featured)} />
                            <Button size="sm" type="submit" variant="ghost">
                              {travelPackage.featured ? "Quitar destacado" : "Destacar"}
                            </Button>
                          </form>
                          <form action={togglePackageFlagAction}>
                            <input type="hidden" name="id" value={travelPackage.id} />
                            <input type="hidden" name="field" value="isActive" />
                            <input type="hidden" name="current" value={String(travelPackage.isActive)} />
                            <Button size="sm" type="submit" variant="ghost">
                              {travelPackage.isActive ? "Ocultar" : "Publicar"}
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
