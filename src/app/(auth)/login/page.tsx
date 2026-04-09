import { AppLogo } from "@/components/layout/app-logo";
import { CustomerAccessForm } from "@/features/auth/components/customer-access-form";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-5xl border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10">
        <CardHeader className="space-y-5">
          <AppLogo />
          <div>
            <CardTitle className="text-3xl">Acceso a la plataforma</CardTitle>
            <CardDescription className="mt-2 text-slate-600">
              El admin entra con credenciales. Tus clientes entran con un acceso seguro por email para ver su viaje, pagos y mensajes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-950">Admin</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Gestiona paquetes, pedidos, cobros, documentos y conversaciones desde tu panel.
                </p>
              </div>
              <LoginForm />
            </div>
            <CustomerAccessForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
