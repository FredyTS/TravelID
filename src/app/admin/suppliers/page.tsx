import Link from "next/link";
import { SupplierStatus } from "@prisma/client";
import { saveSupplierAction } from "@/features/catalog/server/admin-catalog-actions";
import { getAdminSupplierList, getSupplierById } from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [suppliers, currentSupplier] = await Promise.all([
    getAdminSupplierList(),
    editId ? getSupplierById(editId) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Catalogo maestro</p>
            <h1 className="mt-3 text-4xl">Proveedores</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Gestiona claves de proveedor, nombre comercial y contacto para hoteles, paquetes, cotizaciones y seguimiento operativo.
            </p>
          </div>
          <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100">
            {suppliers.length} proveedores
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{currentSupplier ? "Editar proveedor" : "Nuevo proveedor"}</CardTitle>
            {currentSupplier ? (
              <Button asChild variant="ghost">
                <Link href="/admin/suppliers">Limpiar</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form action={saveSupplierAction} className="grid gap-4">
              <input type="hidden" name="id" defaultValue={currentSupplier?.id} />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Clave proveedor</label>
                  <Input name="code" defaultValue={currentSupplier?.code ?? ""} placeholder="OM1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Estatus</label>
                  <select
                    name="status"
                    defaultValue={currentSupplier?.status ?? SupplierStatus.ACTIVE}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
                  >
                    <option value={SupplierStatus.ACTIVE}>Activo</option>
                    <option value={SupplierStatus.INACTIVE}>Inactivo</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Nombre base</label>
                  <Input name="name" defaultValue={currentSupplier?.name ?? ""} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre visible</label>
                  <Input name="displayName" defaultValue={currentSupplier?.displayName ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre comercial</label>
                  <Input name="commercialName" defaultValue={currentSupplier?.commercialName ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input name="email" type="email" defaultValue={currentSupplier?.email ?? ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Telefono</label>
                  <Input name="phone" defaultValue={currentSupplier?.phone ?? ""} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Sitio web</label>
                  <Input name="website" defaultValue={currentSupplier?.website ?? ""} placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Notas</label>
                  <Textarea name="notes" rows={4} defaultValue={currentSupplier?.notes ?? ""} />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {currentSupplier ? "Guardar proveedor" : "Crear proveedor"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Listado de proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Clave</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estatus</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="border-slate-200">
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-950">{supplier.displayName ?? supplier.name}</p>
                          <p className="text-xs text-slate-500">{supplier.commercialName ?? supplier.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{supplier.code ?? "Sin clave"}</TableCell>
                      <TableCell className="text-slate-600">{supplier.email ?? supplier.phone ?? "Sin contacto"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            supplier.status === SupplierStatus.ACTIVE
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          }
                        >
                          {supplier.status === SupplierStatus.ACTIVE ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/suppliers?edit=${supplier.id}`}>Editar</Link>
                        </Button>
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
