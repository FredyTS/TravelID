import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { CustomerAccessForm } from "@/features/auth/components/customer-access-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function resolveCustomerCallbackUrl(nextValue?: string | string[]) {
  const next = Array.isArray(nextValue) ? nextValue[0] : nextValue;

  if (!next?.startsWith("/portal")) {
    return "/portal";
  }

  return next;
}

export default async function CustomerAccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const callbackUrl = resolveCustomerCallbackUrl(params.next);

  return (
    <div className="container-shell safe-top safe-bottom flex min-h-screen items-center justify-center py-10 sm:py-16">
      <Card className="w-full max-w-2xl border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10">
        <CardHeader className="space-y-5">
          <AppLogo />
          <div>
            <CardTitle className="text-2xl sm:text-3xl">Acceso para clientes</CardTitle>
            <CardDescription className="mt-2 text-slate-600">
              Entra con tu correo y te enviaremos un acceso seguro para ver tu viaje, pagos, documentos y mensajes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <CustomerAccessForm callbackUrl={callbackUrl} />
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <p className="font-medium text-slate-950">¿Eres parte del equipo administrador?</p>
            <p className="mt-1">Ingresa desde el acceso interno para gestionar ventas, clientes y operaciones.</p>
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <Link href="/admin-acceso">Ir al login de admin</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
