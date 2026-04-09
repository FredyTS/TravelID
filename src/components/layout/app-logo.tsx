import Link from "next/link";

export function AppLogo() {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-3 font-semibold tracking-tight text-slate-950">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm text-primary-foreground shadow-lg shadow-primary/20 sm:size-11">
        AT
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-heading text-lg sm:text-xl">Alondra Travel MX</span>
        <span className="hidden text-xs font-medium uppercase tracking-[0.24em] text-slate-500 sm:block">
          Viajes, reservas y experiencias
        </span>
      </span>
    </Link>
  );
}
