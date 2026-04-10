"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
  const activeItem =
    nav.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) ?? nav[0];
  const mobileNav = nav.slice(0, 5);
  const shouldRenderBottomNav = mobileNav.length > 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f6_100%)] text-slate-950">
      <div className="grid min-h-screen xl:grid-cols-[292px_1fr]">
        <aside className="hidden border-b border-slate-200/80 bg-white/90 px-5 py-6 backdrop-blur xl:sticky xl:top-0 xl:block xl:h-screen xl:border-r xl:border-b-0">
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
          <div className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur-xl xl:hidden">
            <div className="container-shell safe-top py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <AppLogo />
                  <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                    <span>{title}</span>
                    <ChevronRight className="size-3" />
                    <span className="truncate text-slate-700">{activeItem?.label}</span>
                  </div>
                </div>
                <Badge className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
                  {activeItem?.label}
                </Badge>
              </div>
              <nav className="mobile-scroll-row mt-4 -mx-4 w-[calc(100%+2rem)] px-4">
                {nav.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "snap-start rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition",
                        isActive
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className={cn("container-shell py-5 sm:py-8", shouldRenderBottomNav && "safe-bottom-offset xl:pb-8")}>
            {children}
          </div>
        </main>
      </div>
      {shouldRenderBottomNav ? (
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl xl:hidden">
          <nav className="container-shell grid grid-cols-5 gap-2 py-2">
            {mobileNav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 text-center text-[11px] font-medium leading-tight transition",
                    isActive ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
