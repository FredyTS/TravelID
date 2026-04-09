import { AppLogo } from "@/components/layout/app-logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-16">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10">
        <CardHeader className="space-y-5">
          <AppLogo />
          <div>
            <CardTitle className="text-3xl">Acceso a la plataforma</CardTitle>
            <CardDescription className="mt-2 text-slate-600">
              Base para staff por credenciales y clientes por magic link/email con Auth.js.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-center text-xs text-slate-500">
            Seed local listo para staff. El flujo por magic link para clientes queda preparado para la siguiente iteracion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
