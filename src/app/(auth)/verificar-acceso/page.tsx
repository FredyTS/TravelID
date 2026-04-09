import { AppLogo } from "@/components/layout/app-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <div className="container-shell safe-top safe-bottom flex min-h-screen items-center justify-center py-10 sm:py-16">
      <Card className="w-full max-w-xl border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10">
        <CardHeader className="space-y-5">
          <AppLogo />
          <CardTitle className="text-2xl sm:text-3xl">Revisa tu correo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-slate-600">
          <p>
            Te enviamos un enlace seguro para entrar a tu portal de viaje. Abre el correo en el mismo dispositivo y toca el boton de acceso.
          </p>
          <p className="text-sm text-slate-500">
            Si no aparece en tu bandeja principal, revisa spam o promociones y solicita el acceso otra vez desde la pantalla de acceso.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
