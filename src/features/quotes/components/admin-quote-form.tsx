"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const defaultHotelsJson = JSON.stringify(
  [
    {
      name: "Hotel Cancun Resort",
      code: "HTL-CUN-01",
      image:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
      mealPlan: "All inclusive",
      roomType: "Junior Suite",
      depositDueDate: "15 mayo 2026",
      depositAmount: "$3,500 MXN",
      balanceDueDate: "30 junio 2026",
      balanceAmount: "$9,490 MXN",
      pricePerNight: "$3,247 MXN",
      total: "$12,990 MXN",
      legend: "Tarifa sujeta a disponibilidad al momento de confirmar.",
      note: "Incluye hospedaje, alimentos, acceso a amenidades y asistencia previa al viaje.",
    },
  ],
  null,
  2,
);

const defaultFlightsJson = JSON.stringify(
  {
    baggageLabel: "Tarifa con articulo personal y equipaje de mano",
    personalItemLabel: "1 articulo personal",
    carryOnLabel: "10 kg de mano",
    segments: [
      {
        origin: "Ciudad de Mexico",
        destination: "Cancun",
        departureDate: "2026-08-12",
        departureTime: "08:30",
        arrivalTime: "10:45",
        type: "Vuelo directo",
      },
      {
        origin: "Cancun",
        destination: "Ciudad de Mexico",
        departureDate: "2026-08-16",
        departureTime: "18:40",
        arrivalTime: "21:05",
        type: "Vuelo directo",
      },
    ],
  },
  null,
  2,
);

const defaultTransferJson = JSON.stringify(
  {
    airport: "Aeropuerto Internacional de Cancun",
    adults: 2,
    minors: 0,
    service: "Servicio privado redondo",
    hotels: [
      {
        name: "Hotel Cancun Resort",
        price: "$1,250 MXN",
      },
    ],
  },
  null,
  2,
);

export function AdminQuoteForm({
  packageOptions,
}: {
  packageOptions: { slug: string; name: string; destination: string }[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      try {
        const adults = Number(formData.get("adults") ?? 2);
        const minors = Number(formData.get("minors") ?? 0);
        const destination = String(formData.get("destination") ?? "");
        const checkIn = String(formData.get("checkIn") ?? "");
        const checkOut = String(formData.get("checkOut") ?? "");

        const hotels = JSON.parse(String(formData.get("hotelsJson") ?? "[]"));
        const flightsRaw = String(formData.get("flightsJson") ?? "").trim();
        const transferRaw = String(formData.get("transferJson") ?? "").trim();

        const payload = {
          customerName: String(formData.get("customerName") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          title: String(formData.get("title") ?? ""),
          packageSlug: String(formData.get("packageSlug") ?? ""),
          originCity: String(formData.get("originCity") ?? ""),
          departureDateTentative: String(formData.get("departureDateTentative") ?? ""),
          adults,
          minors,
          subtotal: Number(formData.get("subtotal") ?? 0),
          discountTotal: Number(formData.get("discountTotal") ?? 0),
          depositRequired: Number(formData.get("depositRequired") ?? 0),
          validUntil: String(formData.get("validUntil") ?? ""),
          customerNotes: String(formData.get("customerNotes") ?? ""),
          proposalData: {
            clientName: String(formData.get("customerName") ?? ""),
            clientPhone: String(formData.get("phone") ?? ""),
            destination,
            checkIn,
            checkOut,
            nights: Number(formData.get("nights") ?? 1),
            adults,
            minors,
            minorAges: String(formData.get("minorAges") ?? ""),
            generatedAt: new Date().toLocaleDateString("es-MX"),
            footerNote: String(formData.get("footerNote") ?? ""),
            hotels,
            flights: flightsRaw ? JSON.parse(flightsRaw) : null,
            transfer: transferRaw ? JSON.parse(transferRaw) : null,
          },
        };

        const response = await fetch("/api/admin/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          setMessage(result.message ?? "No fue posible crear la cotizacion.");
          return;
        }

        router.push(`/admin/quotes/${result.quote.id}`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Revisa los bloques JSON de hoteles, vuelos o traslados.");
      }
    });
  }

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-title" className="text-sm font-medium text-slate-700">
          Título interno de la cotización
        </label>
        <Input id="admin-quote-title" name="title" placeholder="Ej. Verano en Cancun para familia Terry" className="md:col-span-2" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-customer" className="text-sm font-medium text-slate-700">
          Nombre del cliente
        </label>
        <Input id="admin-quote-customer" name="customerName" placeholder="Nombre del cliente" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-email" className="text-sm font-medium text-slate-700">
          Correo del cliente
        </label>
        <Input id="admin-quote-email" name="email" placeholder="Correo del cliente" type="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-quote-phone" className="text-sm font-medium text-slate-700">
          Teléfono o WhatsApp
        </label>
        <Input id="admin-quote-phone" name="phone" placeholder="Telefono / WhatsApp" />
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-slate-700">Paquete base (opcional)</label>
        <select
          name="packageSlug"
          defaultValue=""
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
        >
          <option value="">Cotizacion manual / sin paquete base</option>
          {packageOptions.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name} · {pkg.destination}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-sm font-semibold text-slate-900">Datos del viaje</p>
        <p className="mt-1 text-xs text-slate-500">Aclara fechas y ocupación antes de capturar montos o bloques de propuesta.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="admin-quote-destination" className="text-sm font-medium text-slate-700">
              Destino cotizado
            </label>
            <Input id="admin-quote-destination" name="destination" placeholder="Destino cotizado" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-origin" className="text-sm font-medium text-slate-700">
              Ciudad de origen
            </label>
            <Input id="admin-quote-origin" name="originCity" placeholder="Ciudad de origen" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-departure" className="text-sm font-medium text-slate-700">
              Fecha tentativa de salida
            </label>
            <Input id="admin-quote-departure" name="departureDateTentative" type="date" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-valid-until" className="text-sm font-medium text-slate-700">
              Vigencia de la cotización
            </label>
            <Input id="admin-quote-valid-until" name="validUntil" type="date" />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-checkin" className="text-sm font-medium text-slate-700">
              Check-in
            </label>
            <Input id="admin-quote-checkin" name="checkIn" type="date" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-checkout" className="text-sm font-medium text-slate-700">
              Check-out
            </label>
            <Input id="admin-quote-checkout" name="checkOut" type="date" required />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-nights" className="text-sm font-medium text-slate-700">
              Número de noches
            </label>
            <Input id="admin-quote-nights" name="nights" type="number" defaultValue={4} min={1} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-adults" className="text-sm font-medium text-slate-700">
              Número de adultos
            </label>
            <Input id="admin-quote-adults" name="adults" type="number" defaultValue={2} min={1} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-minors" className="text-sm font-medium text-slate-700">
              Número de menores
            </label>
            <Input id="admin-quote-minors" name="minors" type="number" defaultValue={0} min={0} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-minor-ages" className="text-sm font-medium text-slate-700">
              Edades de menores
            </label>
            <Input id="admin-quote-minor-ages" name="minorAges" placeholder="Ej. 5, 8" />
          </div>
        </div>
      </div>
      <div className="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-sm font-semibold text-slate-900">Resumen económico</p>
        <p className="mt-1 text-xs text-slate-500">Estos montos alimentan el total de la cotización y lo que verá el cliente.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="admin-quote-subtotal" className="text-sm font-medium text-slate-700">
              Subtotal cotizado
            </label>
            <Input id="admin-quote-subtotal" name="subtotal" type="number" defaultValue={9990} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-discount" className="text-sm font-medium text-slate-700">
              Descuento aplicado
            </label>
            <Input id="admin-quote-discount" name="discountTotal" type="number" defaultValue={0} />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-quote-deposit" className="text-sm font-medium text-slate-700">
              Anticipo requerido
            </label>
            <Input id="admin-quote-deposit" name="depositRequired" type="number" defaultValue={3500} />
          </div>
        </div>
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-notes" className="text-sm font-medium text-slate-700">
          Notas visibles al cliente
        </label>
        <Textarea
          id="admin-quote-notes"
          name="customerNotes"
          className="md:col-span-2"
          rows={4}
          placeholder="Notas visibles al cliente"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-footer" className="text-sm font-medium text-slate-700">
          Leyenda legal o nota al pie
        </label>
        <Textarea
          id="admin-quote-footer"
          name="footerNote"
          className="md:col-span-2"
          rows={2}
          defaultValue="*Precio cotizado por el total en moneda mexicana, sujeto a disponibilidad y cambios sin previo aviso."
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-hotels-json" className="text-sm font-medium text-slate-700">
          Bloque JSON de hoteles
        </label>
        <p className="text-xs text-slate-500">
          Aquí capturas lo que debe aparecer en la propuesta final: hotel, plan, habitación, anticipo, saldo, precio por noche, leyenda y nota.
        </p>
        <Textarea
          id="admin-quote-hotels-json"
          name="hotelsJson"
          className="md:col-span-2 min-h-72 font-mono text-xs"
          defaultValue={defaultHotelsJson}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-flights-json" className="text-sm font-medium text-slate-700">
          Bloque JSON de vuelos
        </label>
        <p className="text-xs text-slate-500">
          Incluye segmentos, horarios y equipaje cuando la propuesta contemple vuelos.
        </p>
        <Textarea
          id="admin-quote-flights-json"
          name="flightsJson"
          className="md:col-span-2 min-h-60 font-mono text-xs"
          defaultValue={defaultFlightsJson}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="admin-quote-transfer-json" className="text-sm font-medium text-slate-700">
          Bloque JSON de traslados
        </label>
        <p className="text-xs text-slate-500">
          Úsalo para aeropuerto, servicio contratado y tabla de precios por hotel si aplica.
        </p>
        <Textarea
          id="admin-quote-transfer-json"
          name="transferJson"
          className="md:col-span-2 min-h-48 font-mono text-xs"
          defaultValue={defaultTransferJson}
        />
      </div>
      <Button className="md:col-span-2" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creando cotizacion...
          </>
        ) : (
          "Crear cotizacion con propuesta"
        )}
      </Button>
      {message ? <p className="md:col-span-2 text-sm text-amber-600">{message}</p> : null}
    </form>
  );
}
