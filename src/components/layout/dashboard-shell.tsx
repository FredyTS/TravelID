"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/layout/app-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function DashboardShell({
  children,
  nav,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  nav: NavItem[];
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f6_100%)] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[292px_1fr]">
        <aside className="border-b border-slate-200/80 bg-white/90 px-5 py-6 backdrop-blur xl:sticky xl:top-0 xl:h-screen xl:border-r xl:border-b-0">
          <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_100%)] p-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.45)]">
            <AppLogo />
            <div className="mt-5 space-y-3">
              <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                {title}
              </Badge>
              <p className="text-sm leading-6 text-slate-600">{subtitle}</p>
            </div>
          </div>
          <nav className="mt-6 grid gap-1.5">
            {nav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">
          <div className="container-shell py-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
