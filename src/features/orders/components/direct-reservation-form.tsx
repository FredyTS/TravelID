"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DirectReservationForm({
  packageName,
  includedTravelers,
  departureCity,
  packageSlug,
}: {
  packageName: string;
  includedTravelers: string;
  departureCity: string;
  packageSlug: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const payload = {
        packageSlug,
        firstName: String(formData.get("firstName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        departureDate: String(formData.get("departureDate") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      };

      const response = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setMessage(result.message ?? "Solicitud procesada.");
    });
  }

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Paquete seleccionado</label>
        <Input defaultValue={packageName} readOnly />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Precio publicado para</label>
        <Input defaultValue={includedTravelers} readOnly />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Ciudad de salida incluida en el precio</label>
        <Input defaultValue={departureCity} readOnly />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="reservation-name" className="text-sm font-medium text-slate-700">
          Nombre completo del titular
        </label>
        <Input id="reservation-name" name="firstName" placeholder="Nombre completo" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="reservation-email" className="text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <Input id="reservation-email" name="email" placeholder="Correo electronico" type="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="reservation-phone" className="text-sm font-medium text-slate-700">
          Teléfono o WhatsApp
        </label>
        <Input id="reservation-phone" name="phone" placeholder="Telefono / WhatsApp" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="reservation-date" className="text-sm font-medium text-slate-700">
          Fecha deseada para viajar
        </label>
        <Input id="reservation-date" name="departureDate" type="date" />
      </div>
      <p className="md:col-span-2 text-xs text-slate-500">
        Esta reserva inmediata aplica cuando sí viajas desde {departureCity} y el paquete coincide con tu grupo. Si necesitas otra ciudad de salida, otro número de viajeros o cambios en el paquete, te conviene pedir cotización personalizada.
      </p>
      <Textarea
        name="notes"
        className="md:col-span-2"
        placeholder="Notas adicionales sobre tu viaje o sobre el momento en que deseas apartarlo."
        rows={5}
      />
      <Button className="md:col-span-2" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creando reserva inmediata...
          </>
        ) : (
          "Continuar con precio publicado"
        )}
      </Button>
      {message ? <p className="md:col-span-2 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
