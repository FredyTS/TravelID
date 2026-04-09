import Link from "next/link";
import { portalTrips } from "@/lib/constants/mock-data";

export default function PortalTripsPage() {
  return (
    <div className="surface space-y-4 p-8 text-slate-900">
      <h1 className="text-4xl">Mis viajes</h1>
      <div className="grid gap-4">
        {portalTrips.map((trip) => (
          <Link key={trip.id} href={`/portal/viajes/${trip.id}`} className="rounded-3xl border p-5 transition hover:border-primary">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xl font-semibold">{trip.title}</p>
                <p className="mt-1 text-sm text-slate-600">{trip.status}</p>
              </div>
              <p className="text-sm font-medium text-primary">{trip.departure}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
