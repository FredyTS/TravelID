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
      <Input defaultValue={packageName} readOnly className="md:col-span-2" />
      <Input defaultValue={includedTravelers} readOnly className="md:col-span-2" />
      <Input name="firstName" placeholder="Nombre completo" className="md:col-span-2" required />
      <Input name="email" placeholder="Correo electronico" type="email" required />
      <Input name="phone" placeholder="Telefono / WhatsApp" />
      <Input name="originCity" placeholder="Ciudad de origen" />
      <Input name="departureDate" placeholder="Fecha deseada" type="date" />
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
