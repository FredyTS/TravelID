import Link from "next/link";
import { saveMealPlanAction } from "@/features/catalog/server/admin-catalog-actions";
import { getMealPlanById, getMealPlanOptions } from "@/features/catalog/server/catalog-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function AdminMealPlansPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [mealPlans, currentMealPlan] = await Promise.all([
    getMealPlanOptions(),
    editId ? getMealPlanById(editId) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      <section className="surface p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-700">Catalogo maestro</p>
            <h1 className="mt-3 text-4xl">Planes de alimentos</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Mantén controlados los planes comerciales y operativos que usarán hoteles, paquetes y cotizaciones.
            </p>
          </div>
          <Badge className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-100">
            {mealPlans.length} planes
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{currentMealPlan ? "Editar plan" : "Nuevo plan"}</CardTitle>
            {currentMealPlan ? (
              <Button asChild variant="ghost">
                <Link href="/admin/meal-plans">Limpiar</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            <form action={saveMealPlanAction} className="grid gap-4">
              <input type="hidden" name="id" defaultValue={currentMealPlan?.id} />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Clave</label>
                <Input name="code" defaultValue={currentMealPlan?.code ?? ""} placeholder="AI" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <Input name="name" defaultValue={currentMealPlan?.name ?? ""} placeholder="All Inclusive" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripcion</label>
                <Textarea name="description" rows={4} defaultValue={currentMealPlan?.description ?? ""} />
              </div>
              <Button type="submit" className="w-full">
                {currentMealPlan ? "Guardar plan" : "Crear plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Listado de planes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead>Clave</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealPlans.map((mealPlan) => (
                    <TableRow key={mealPlan.id} className="border-slate-200">
                      <TableCell className="font-medium text-slate-950">{mealPlan.code}</TableCell>
                      <TableCell className="text-slate-700">{mealPlan.name}</TableCell>
                      <TableCell className="max-w-xl text-slate-600">{mealPlan.description ?? "Sin descripcion"}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/meal-plans?edit=${mealPlan.id}`}>Editar</Link>
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
