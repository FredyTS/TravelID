import Link from "next/link";
import { saveHotelAction, toggleHotelActiveAction } from "@/features/catalog/server/admin-catalog-actions";
import {
  getAdminCatalogOverview,
  getHotelAmenityOptions,
  getDestinationOptions,
  getHotelById,
  getMealPlanOptions,
  getSupplierOptions,
} from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminHotelsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [{ hotels }, destinations, suppliers, mealPlans, amenityOptions, currentHotel] = await Promise.all([
    getAdminCatalogOverview(),
    getDestinationOptions(),
    getSupplierOptions(),
    getMealPlanOptions(),
    getHotelAmenityOptions(),
    editId ? getHotelById(editId) : Promise.resolve(null),
  ]);
  const currentAmenityIds = new Set(currentHotel?.amenityAssignments.map((assignment) => assignment.amenityId) ?? []);
  const currentMealPlanIds = new Set(currentHotel?.mealPlans.map((assignment) => assignment.mealPlanId) ?? []);
  const roomTypesJson = JSON.stringify(
    currentHotel?.roomTypes.map((roomType) => ({
      code: roomType.code ?? "",
      name: roomType.name,
      description: roomType.description ?? "",
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
      mealPlanId: roomType.mealPlanId ?? "",
      isActive: roomType.isActive,
    })) ?? [],
    null,
    2,
  );
  const imageUrls = (currentHotel?.images ?? []).map((image) => image.url).join("\n");

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Inventario base</p>
            <h1 className="mt-3 text-4xl">Hoteles</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Registra propiedades, categoria, amenidades y destino para luego reutilizarlos en paquetes y cotizaciones.
            </p>
          </div>
          <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100">
            {hotels.length} hoteles cargados
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{currentHotel ? "Editar hotel" : "Nuevo hotel"}</CardTitle>
            {currentHotel ? (
              <Button asChild variant="ghost">
                <Link href="/admin/hotels">Limpiar</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form action={saveHotelAction} className="grid gap-4">
              <input type="hidden" name="id" defaultValue={currentHotel?.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <Input name="name" defaultValue={currentHotel?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Codigo legacy / ID hotel</label>
                  <Input name="legacyHotelCode" defaultValue={currentHotel?.legacyHotelCode ?? ""} placeholder="101" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <Input name="slug" defaultValue={currentHotel?.slug ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Proveedor principal</label>
                  <select
                    name="supplierId"
                    defaultValue={currentHotel?.supplierId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Sin proveedor asignado</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {(supplier.displayName ?? supplier.name) + (supplier.code ? ` · ${supplier.code}` : "")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Categoria</label>
                  <Input name="category" defaultValue={currentHotel?.category ?? ""} placeholder="5 estrellas" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Rating de estrellas</label>
                  <Input name="starRating" type="number" min={1} max={5} defaultValue={currentHotel?.starRating ?? ""} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de propiedad</label>
                  <Input name="propertyType" defaultValue={currentHotel?.propertyType ?? ""} placeholder="Resort, Hotel urbano, Boutique..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Destino</label>
                  <select
                    name="destinationId"
                    defaultValue={currentHotel?.destinationId ?? destinations[0]?.id}
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
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Operacion y contacto</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Telefono</label>
                    <Input name="phone" defaultValue={currentHotel?.phone ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Imagen principal</label>
                    <Input name="heroImageUrl" defaultValue={currentHotel?.heroImageUrl ?? ""} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Check-in</label>
                    <Input name="checkInTime" defaultValue={currentHotel?.checkInTime ?? ""} placeholder="15:00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Check-out</label>
                    <Input name="checkOutTime" defaultValue={currentHotel?.checkOutTime ?? ""} placeholder="12:00" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Direccion</label>
                <Input name="address" defaultValue={currentHotel?.address ?? ""} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Resumen corto</label>
                <Textarea name="shortDescription" rows={2} defaultValue={currentHotel?.shortDescription ?? ""} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Amenidades libres visibles</label>
                <Input
                  name="amenities"
                  defaultValue={Array.isArray(currentHotel?.amenities) ? currentHotel?.amenities.join(", ") : ""}
                  placeholder="Alberca, Spa, Kids Club"
                />
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Amenidades y servicios estructurados</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {amenityOptions.map((amenity) => (
                    <label
                      key={amenity.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="amenityIds"
                        value={amenity.id}
                        defaultChecked={currentAmenityIds.has(amenity.id)}
                      />
                      {amenity.name}
                    </label>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="hasPool" defaultChecked={currentHotel?.hasPool ?? false} />
                    Alberca
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="hasSpa" defaultChecked={currentHotel?.hasSpa ?? false} />
                    Spa
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="hasGym" defaultChecked={currentHotel?.hasGym ?? false} />
                    Gym
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="beachAccess" defaultChecked={currentHotel?.beachAccess ?? false} />
                    Acceso a playa
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="petFriendly" defaultChecked={currentHotel?.petFriendly ?? false} />
                    Acepta mascotas
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="hasParking" defaultChecked={currentHotel?.hasParking ?? false} />
                    Estacionamiento
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="hasWifi" defaultChecked={currentHotel?.hasWifi ?? false} />
                    Wifi
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <input type="checkbox" name="hasAirConditioning" defaultChecked={currentHotel?.hasAirConditioning ?? false} />
                    Aire acondicionado
                  </label>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Planes y habitaciones</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {mealPlans.map((mealPlan) => (
                    <label
                      key={mealPlan.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="mealPlanIds"
                        value={mealPlan.id}
                        defaultChecked={currentMealPlanIds.has(mealPlan.id)}
                      />
                      {mealPlan.name}
                    </label>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipos de habitacion (JSON)</label>
                  <p className="text-xs text-slate-500">
                    Captura cada habitacion con nombre, codigo, maxAdults, maxChildren, mealPlanId y descripcion.
                  </p>
                  <Textarea name="roomTypesJson" rows={10} className="font-mono text-xs" defaultValue={roomTypesJson} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Imagenes y notas internas</p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">URLs de imagenes (una por linea)</label>
                    <Textarea name="imageUrls" rows={5} defaultValue={imageUrls} placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Cargos adicionales</label>
                    <Textarea name="extraChargesNotes" rows={3} defaultValue={currentHotel?.extraChargesNotes ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Notas internas</label>
                    <Textarea name="internalNotes" rows={3} defaultValue={currentHotel?.internalNotes ?? ""} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripcion</label>
                <Textarea name="description" rows={5} defaultValue={currentHotel?.description ?? ""} />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input type="checkbox" name="isActive" defaultChecked={currentHotel ? currentHotel.isActive : true} />
                Hotel activo en catalogo
              </label>

              <Button type="submit" className="w-full">
                {currentHotel ? "Guardar cambios" : "Crear hotel"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Listado de hoteles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <Table>
                <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead>Hotel</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estatus</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((hotel) => (
                    <TableRow key={hotel.id} className="border-slate-200">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{hotel.name}</p>
                          <p className="text-xs text-slate-500">/{hotel.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{hotel.destination.name}</TableCell>
                      <TableCell className="text-slate-600">{hotel.supplier?.displayName ?? hotel.supplier?.name ?? "Sin proveedor"}</TableCell>
                      <TableCell className="text-slate-600">{hotel.category ?? "Sin categoria"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            hotel.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          }
                        >
                          {hotel.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/hotels?edit=${hotel.id}`}>Editar</Link>
                          </Button>
                          <form action={toggleHotelActiveAction}>
                            <input type="hidden" name="id" value={hotel.id} />
                            <input type="hidden" name="current" value={String(hotel.isActive)} />
                            <Button size="sm" type="submit" variant="ghost">
                              {hotel.isActive ? "Desactivar" : "Activar"}
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
