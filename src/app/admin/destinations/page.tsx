import Link from "next/link";
import { saveDestinationAction, toggleDestinationActiveAction } from "@/features/catalog/server/admin-catalog-actions";
import {
  getAdminCatalogOverview,
  getDestinationById,
} from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [{ destinations }, currentDestination] = await Promise.all([
    getAdminCatalogOverview(),
    editId ? getDestinationById(editId) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Catalogo base</p>
            <h1 className="mt-3 text-4xl">Destinos</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Administra los destinos que alimentan el catalogo, los hoteles, las promociones y las cotizaciones.
            </p>
          </div>
          <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100">
            {destinations.length} destinos cargados
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{currentDestination ? "Editar destino" : "Nuevo destino"}</CardTitle>
            {currentDestination ? (
              <Button asChild variant="ghost">
                <Link href="/admin/destinations">Limpiar</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form action={saveDestinationAction} className="grid gap-4">
              <input type="hidden" name="id" defaultValue={currentDestination?.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <Input name="name" defaultValue={currentDestination?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <Input name="slug" defaultValue={currentDestination?.slug ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Pais</label>
                  <Input name="country" defaultValue={currentDestination?.country ?? "Mexico"} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Region o zona</label>
                  <Input name="region" defaultValue={currentDestination?.region ?? ""} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Imagen principal</label>
                <Input name="heroImageUrl" defaultValue={currentDestination?.heroImageUrl ?? ""} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripcion</label>
                <Textarea name="description" rows={4} defaultValue={currentDestination?.description ?? ""} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">SEO title</label>
                  <Input name="seoTitle" defaultValue={currentDestination?.seoTitle ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">SEO description</label>
                  <Input name="seoDescription" defaultValue={currentDestination?.seoDescription ?? ""} />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={currentDestination ? currentDestination.isActive : true}
                />
                Destino activo en catalogo
              </label>

              <Button type="submit" className="w-full">
                {currentDestination ? "Guardar cambios" : "Crear destino"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Listado de destinos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Destino</TableHead>
                    <TableHead>Pais / Region</TableHead>
                    <TableHead>Relacionados</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinations.map((destination) => (
                    <TableRow key={destination.id} className="border-slate-200">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{destination.name}</p>
                          <p className="text-xs text-slate-500">/{destination.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {destination.country}
                        {destination.region ? ` · ${destination.region}` : ""}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {destination._count.hotels} hoteles · {destination._count.packages} paquetes
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            destination.isActive
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          }
                        >
                          {destination.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/destinations?edit=${destination.id}`}>Editar</Link>
                          </Button>
                          <form action={toggleDestinationActiveAction}>
                            <input type="hidden" name="id" value={destination.id} />
                            <input type="hidden" name="current" value={String(destination.isActive)} />
                            <Button size="sm" type="submit" variant="ghost">
                              {destination.isActive ? "Desactivar" : "Activar"}
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
