import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAccessPage() {
  return (
    <div className="container-shell safe-top safe-bottom flex min-h-screen items-center justify-center py-10 sm:py-16">
      <Card className="w-full max-w-2xl border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10">
        <CardHeader className="space-y-5">
          <AppLogo />
          <div>
            <CardTitle className="text-2xl sm:text-3xl">Acceso administrativo</CardTitle>
            <CardDescription className="mt-2 text-slate-600">
              Entra con tus credenciales para administrar cotizaciones, pedidos, clientes, pagos y conversaciones.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <LoginForm />
          </div>
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <p className="font-medium text-slate-950">¿Buscabas el portal del cliente?</p>
            <p className="mt-1">Los viajeros entran con un acceso seguro por email desde la página de clientes.</p>
            <Button asChild variant="outline" className="mt-4 w-full sm:w-auto">
              <Link href="/acceso">Ir al acceso de clientes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
