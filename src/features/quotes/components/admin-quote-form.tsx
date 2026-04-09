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

export function AdminQuoteForm() {
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
      <Input name="title" placeholder="Titulo de la cotizacion" className="md:col-span-2" required />
      <Input name="customerName" placeholder="Nombre del cliente" required />
      <Input name="email" placeholder="Correo del cliente" type="email" required />
      <Input name="phone" placeholder="Telefono / WhatsApp" />
      <Input name="packageSlug" placeholder="Slug del paquete (opcional)" />
      <Input name="destination" placeholder="Destino cotizado" required />
      <Input name="originCity" placeholder="Ciudad de origen" />
      <Input name="departureDateTentative" type="date" />
      <Input name="checkIn" type="date" required />
      <Input name="checkOut" type="date" required />
      <Input name="validUntil" type="date" />
      <Input name="nights" type="number" defaultValue={4} min={1} />
      <Input name="adults" type="number" defaultValue={2} min={1} />
      <Input name="minors" type="number" defaultValue={0} min={0} />
      <Input name="minorAges" placeholder="Edades menores. Ej: 5, 8" />
      <Input name="subtotal" type="number" defaultValue={9990} />
      <Input name="discountTotal" type="number" defaultValue={0} />
      <Input name="depositRequired" type="number" defaultValue={3500} />
      <Textarea
        name="customerNotes"
        className="md:col-span-2"
        rows={4}
        placeholder="Notas visibles al cliente"
      />
      <Textarea
        name="footerNote"
        className="md:col-span-2"
        rows={2}
        defaultValue="*Precio cotizado por el total en moneda mexicana, sujeto a disponibilidad y cambios sin previo aviso."
      />
      <Textarea
        name="hotelsJson"
        className="md:col-span-2 min-h-72 font-mono text-xs"
        defaultValue={defaultHotelsJson}
      />
      <Textarea
        name="flightsJson"
        className="md:col-span-2 min-h-60 font-mono text-xs"
        defaultValue={defaultFlightsJson}
      />
      <Textarea
        name="transferJson"
        className="md:col-span-2 min-h-48 font-mono text-xs"
        defaultValue={defaultTransferJson}
      />
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
