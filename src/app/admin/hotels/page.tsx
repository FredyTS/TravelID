import Link from "next/link";
import { saveHotelAction, toggleHotelActiveAction } from "@/features/catalog/server/admin-catalog-actions";
import {
  getAdminCatalogOverview,
  getDestinationOptions,
  getHotelById,
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
  const [{ hotels }, destinations, currentHotel] = await Promise.all([
    getAdminCatalogOverview(),
    getDestinationOptions(),
    editId ? getHotelById(editId) : Promise.resolve(null),
  ]);

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
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <Input name="slug" defaultValue={currentHotel?.slug ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Categoria</label>
                  <Input name="category" defaultValue={currentHotel?.category ?? ""} placeholder="5 estrellas" />
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Direccion</label>
                <Input name="address" defaultValue={currentHotel?.address ?? ""} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Amenidades</label>
                <Input
                  name="amenities"
                  defaultValue={Array.isArray(currentHotel?.amenities) ? currentHotel?.amenities.join(", ") : ""}
                  placeholder="Alberca, Spa, Kids Club"
                />
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
