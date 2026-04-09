import Link from "next/link";
import { DiscountType, PromotionAppliesTo } from "@prisma/client";
import { savePromotionAction, togglePromotionActiveAction } from "@/features/catalog/server/admin-catalog-actions";
import {
  getAdminCatalogOverview,
  getDestinationOptions,
  getPackageOptions,
  getPromotionById,
} from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const today = new Date().toISOString().slice(0, 10);

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [{ promotions }, destinations, packages, currentPromotion] = await Promise.all([
    getAdminCatalogOverview(),
    getDestinationOptions(),
    getPackageOptions(),
    editId ? getPromotionById(editId) : Promise.resolve(null),
  ]);
  const startsAtValue = currentPromotion ? currentPromotion.startsAt.toISOString().slice(0, 10) : today;
  const endsAtValue = currentPromotion ? currentPromotion.endsAt.toISOString().slice(0, 10) : today;

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Campanas comerciales</p>
            <h1 className="mt-3 text-4xl">Promociones</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Configura descuentos por paquete o destino para mover reservas y comunicarlos en la home y el catalogo.
            </p>
          </div>
          <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100">
            {promotions.length} promociones registradas
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{currentPromotion ? "Editar promocion" : "Nueva promocion"}</CardTitle>
            {currentPromotion ? (
              <Button asChild variant="ghost">
                <Link href="/admin/promotions">Limpiar</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form action={savePromotionAction} className="grid gap-4">
              <input type="hidden" name="id" defaultValue={currentPromotion?.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <Input name="name" defaultValue={currentPromotion?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <Input name="slug" defaultValue={currentPromotion?.slug ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Codigo promocional</label>
                  <Input name="code" defaultValue={currentPromotion?.code ?? ""} placeholder="VERANO2026" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripcion</label>
                <Textarea name="description" rows={4} defaultValue={currentPromotion?.description ?? ""} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo descuento</label>
                  <select
                    name="discountType"
                    defaultValue={currentPromotion?.discountType ?? DiscountType.PERCENT}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value={DiscountType.PERCENT}>Porcentaje</option>
                    <option value={DiscountType.FIXED}>Monto fijo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Valor</label>
                  <Input
                    name="discountValue"
                    type="number"
                    min={0}
                    defaultValue={Number(currentPromotion?.discountValue ?? 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Aplica a</label>
                  <select
                    name="appliesTo"
                    defaultValue={currentPromotion?.appliesTo ?? PromotionAppliesTo.PACKAGE}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value={PromotionAppliesTo.PACKAGE}>Paquete</option>
                    <option value={PromotionAppliesTo.DESTINATION}>Destino</option>
                    <option value={PromotionAppliesTo.ORDER}>Pedido</option>
                    <option value={PromotionAppliesTo.QUOTE}>Cotizacion</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Paquete</label>
                  <select
                    name="packageId"
                    defaultValue={currentPromotion?.packageId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Catalogo general</option>
                    {packages.map((travelPackage) => (
                      <option key={travelPackage.id} value={travelPackage.id}>
                        {travelPackage.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Destino</label>
                  <select
                    name="destinationId"
                    defaultValue={currentPromotion?.destinationId ?? ""}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value="">Sin destino especifico</option>
                    {destinations.map((destination) => (
                      <option key={destination.id} value={destination.id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Inicia</label>
                  <Input
                    name="startsAt"
                    type="date"
                    defaultValue={startsAtValue}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Termina</label>
                  <Input
                    name="endsAt"
                    type="date"
                    defaultValue={endsAtValue}
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="isPublic" defaultChecked={currentPromotion ? currentPromotion.isPublic : true} />
                  Visible al cliente
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input type="checkbox" name="isActive" defaultChecked={currentPromotion ? currentPromotion.isActive : true} />
                  Promocion activa
                </label>
              </div>

              <Button type="submit" className="w-full">
                {currentPromotion ? "Guardar promocion" : "Crear promocion"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Promociones cargadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Promocion</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Aplica a</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id} className="border-slate-200">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{promotion.name}</p>
                          <p className="text-xs text-slate-500">/{promotion.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {promotion.startsAt.toLocaleDateString("es-MX")} - {promotion.endsAt.toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {promotion.package?.name ?? promotion.destination?.name ?? "Catalogo general"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={
                              promotion.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                            }
                          >
                            {promotion.isActive ? "Activa" : "Inactiva"}
                          </Badge>
                          {promotion.isPublic ? (
                            <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100">Publica</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/promotions?edit=${promotion.id}`}>Editar</Link>
                          </Button>
                          <form action={togglePromotionActiveAction}>
                            <input type="hidden" name="id" value={promotion.id} />
                            <input type="hidden" name="current" value={String(promotion.isActive)} />
                            <Button size="sm" type="submit" variant="ghost">
                              {promotion.isActive ? "Desactivar" : "Activar"}
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
