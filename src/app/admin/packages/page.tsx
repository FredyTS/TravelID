import Link from "next/link";
import { TravelType } from "@prisma/client";
import { savePackageAction, togglePackageFlagAction } from "@/features/catalog/server/admin-catalog-actions";
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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const travelTypeOptions: { value: TravelType; label: string }[] = [
  { value: "BEACH", label: "Playa" },
  { value: "CITY", label: "Ciudad" },
  { value: "ADVENTURE", label: "Aventura" },
  { value: "HONEYMOON", label: "Luna de miel" },
  { value: "FAMILY", label: "Familiar" },
  { value: "CRUISE", label: "Crucero" },
  { value: "CUSTOM", label: "Personalizado" },
];

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
            <form action={savePackageAction} className="grid gap-4">
              <input type="hidden" name="id" defaultValue={currentPackage?.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <Input name="name" defaultValue={currentPackage?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <Input name="slug" defaultValue={currentPackage?.slug ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de viaje</label>
                  <select
                    name="travelType"
                    defaultValue={currentPackage?.travelType ?? "BEACH"}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    {travelTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Destino</label>
                  <select
                    name="destinationId"
                    defaultValue={currentPackage?.destinationId ?? destinations[0]?.id}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                    required
                  >
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Hotel sugerido</label>
                  <select
                    name="hotelId"
                    defaultValue={currentPackage?.hotelId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Sin hotel vinculado</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name} · {hotel.destination.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Proveedor base</label>
                  <select
                    name="supplierId"
                    defaultValue={currentPackage?.supplierId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Sin proveedor principal</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {(supplier.displayName ?? supplier.name) + (supplier.code ? ` · ${supplier.code}` : "")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ubicacion visible</label>
                  <Input name="locationLabel" defaultValue={currentPackage?.locationLabel ?? ""} placeholder="Caribe Mexicano" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ciudad de salida incluida</label>
                  <Input name="departureCity" defaultValue={currentPackage?.departureCity ?? ""} placeholder="Ciudad de Mexico" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Plan base</label>
                  <select
                    name="mealPlanId"
                    defaultValue={currentPackage?.mealPlanId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Plan por definir</option>
                    {mealPlans.map((mealPlan) => (
                      <option key={mealPlan.id} value={mealPlan.id}>
                        {mealPlan.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Habitacion base</label>
                  <select
                    name="defaultRoomTypeId"
                    defaultValue={currentPackage?.defaultRoomTypeId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Habitacion por definir</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>
                        {roomType.name} · {roomType.hotel.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Resumen corto</label>
                <Textarea name="summary" rows={3} defaultValue={currentPackage?.summary ?? ""} required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripcion</label>
                <Textarea name="description" rows={5} defaultValue={currentPackage?.description ?? ""} required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Base de precio publicada</label>
                  <Input
                    name="priceBasis"
                    defaultValue={currentPackage?.priceBasis ?? ""}
                    placeholder="Tarifa publicada desde Chihuahua para 2 adultos"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Condiciones de reserva inmediata</label>
                  <Input
                    name="bookingConditionsSummary"
                    defaultValue={currentPackage?.bookingConditionsSummary ?? ""}
                    placeholder="Salida desde CDMX, Junior Suite, plan all inclusive"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Imagen hero</label>
                  <Input name="heroImageUrl" defaultValue={currentPackage?.heroImageUrl ?? ""} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Highlight comercial</label>
                  <Input name="highlight" defaultValue={currentPackage?.highlight ?? ""} placeholder="Anticipo desde..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Galeria</label>
                  <Input
                    name="galleryUrls"
                    defaultValue={Array.isArray(currentPackage?.galleryUrls) ? currentPackage.galleryUrls.join(", ") : ""}
                    placeholder="URL1, URL2, URL3"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Tags de marketing</label>
                  <Input
                    name="marketingTags"
                    defaultValue={Array.isArray(currentPackage?.marketingTags) ? currentPackage.marketingTags.join(", ") : ""}
                    placeholder="All inclusive, Traslados, Familiar"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Dias</label>
                  <Input name="durationDays" type="number" min={1} defaultValue={currentPackage?.durationDays ?? 5} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Noches</label>
                  <Input name="durationNights" type="number" min={1} defaultValue={currentPackage?.durationNights ?? 4} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Precio desde</label>
                  <Input
                    name="basePriceFrom"
                    type="number"
                    min={0}
                    defaultValue={Number(currentPackage?.basePriceFrom ?? 0)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Adultos incluidos</label>
                  <Input name="includedAdults" type="number" min={1} defaultValue={currentPackage?.includedAdults ?? 2} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Menores incluidos</label>
                  <Input name="includedMinors" type="number" min={0} defaultValue={currentPackage?.includedMinors ?? 0} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Minimo viajeros</label>
                  <Input name="minTravelers" type="number" min={1} defaultValue={currentPackage?.minTravelers ?? 1} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nota de reserva</label>
                <Textarea
                  name="reservationNote"
                  rows={3}
                  defaultValue={currentPackage?.reservationNote ?? ""}
                  placeholder="Aclara cuándo aplica el precio publicado y cuándo conviene cotizar."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="directBookable" defaultChecked={currentPackage?.directBookable ?? false} />
                  Permite reserva inmediata
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="featured" defaultChecked={currentPackage?.featured ?? false} />
                  Destacado en home
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={currentPackage ? currentPackage.isActive : true} />
                  Visible en catalogo
                </label>
              </div>

              <Button type="submit" className="w-full">
                {currentPackage ? "Guardar paquete" : "Crear paquete"}
              </Button>
            </form>
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
