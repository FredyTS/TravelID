import Link from "next/link";
import { AppLogo } from "@/components/layout/app-logo";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/paquetes", label: "Paquetes" },
  { href: "/promociones", label: "Promociones" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacto", label: "Contacto" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-background/80 backdrop-blur-xl">
        <div className="container-shell flex min-h-20 items-center justify-between gap-6">
          <AppLogo />
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/70 bg-white/80">
        <div className="container-shell grid gap-8 py-10 md:grid-cols-3">
          <div className="space-y-3">
            <AppLogo />
            <p className="max-w-sm text-sm text-slate-600">
              Paquetes vacacionales, cotizaciones personalizadas y seguimiento completo para cada viaje.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Canales</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>{siteConfig.phone}</p>
              <p>{siteConfig.supportEmail}</p>
              <Link href={siteConfig.whatsappUrl} target="_blank" rel="noreferrer" className="block text-primary">
                Abrir WhatsApp
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Servicios</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Paquetes a playa, escapadas y viajes a medida</li>
              <li>Reservas con anticipo o pago total</li>
              <li>Documentos, itinerario y soporte previo al viaje</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
