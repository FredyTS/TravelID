import { portalTrips } from "@/lib/constants/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortalDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl text-white">Resumen de tu viaje</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {portalTrips.map((trip) => (
          <Card key={trip.id} className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle>{trip.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>Estatus: {trip.status}</p>
              <p>Salida: {trip.departure}</p>
              <p>Saldo pendiente: {trip.balance}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
