import Link from "next/link";

export function AppLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 font-semibold tracking-tight text-slate-950">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm text-primary-foreground shadow-lg shadow-primary/20">
        AT
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-xl">Alondra Travel MX</span>
        <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          Viajes, reservas y experiencias
        </span>
      </span>
    </Link>
  );
}
