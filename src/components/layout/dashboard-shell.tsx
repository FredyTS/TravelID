import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-slate-950/90 px-6 py-8 lg:border-r lg:border-b-0">
          <div className="rounded-3xl bg-white/5 p-5">
            <AppLogo />
            <div className="mt-5">
              <Badge className="bg-amber-300 text-slate-950 hover:bg-amber-300">{title}</Badge>
              <p className="mt-3 text-sm text-slate-300">{subtitle}</p>
            </div>
          </div>
          <nav className="mt-8 grid gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
          <div className="container-shell py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
