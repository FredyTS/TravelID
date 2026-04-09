"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DirectReservationForm({
  packageName,
  includedTravelers,
  packageSlug,
}: {
  packageName: string;
  includedTravelers: string;
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
        originCity: String(formData.get("originCity") ?? ""),
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
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Precio publicado para</label>
        <Input defaultValue={includedTravelers} readOnly />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="reservation-name" className="text-sm font-medium text-slate-700">
          Nombre completo del titular
        </label>
        <Input id="reservation-name" name="firstName" placeholder="Nombre completo" className="md:col-span-2" required />
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
      <div className="space-y-2">
        <label htmlFor="reservation-origin" className="text-sm font-medium text-slate-700">
          Ciudad de origen
        </label>
        <Input id="reservation-origin" name="originCity" placeholder="Ciudad de origen" />
      </div>
      <div className="space-y-2">
        <label htmlFor="reservation-date" className="text-sm font-medium text-slate-700">
          Fecha deseada para viajar
        </label>
        <Input id="reservation-date" name="departureDate" type="date" />
      </div>
      <p className="md:col-span-2 text-xs text-slate-500">
        Este formulario aplica cuando el paquete sí encaja tal como está publicado. Si necesitas cambiar viajeros, edades o condiciones, conviene pedir cotización personalizada.
      </p>
      <Textarea
        name="notes"
        className="md:col-span-2"
        placeholder="Notas adicionales. Si necesitas cambiar viajeros, edades o condiciones, mejor usa el flujo de cotizacion."
        rows={5}
      />
      <Button className="md:col-span-2" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creando reserva...
          </>
        ) : (
          "Continuar con reserva"
        )}
      </Button>
      {message ? <p className="md:col-span-2 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
