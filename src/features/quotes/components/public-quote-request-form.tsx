"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PublicQuoteRequestForm({ selectedPackage }: { selectedPackage?: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const payload = {
        firstName: String(formData.get("firstName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        originCity: String(formData.get("originCity") ?? ""),
        tentativeDate: String(formData.get("tentativeDate") ?? ""),
        packageSlug: String(formData.get("packageSlug") ?? ""),
        adults: Number(formData.get("adults") ?? 2),
        minors: Number(formData.get("minors") ?? 0),
        notes: String(formData.get("notes") ?? ""),
      };

      const response = await fetch("/api/public/quotes/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setMessage(result.message ?? "Solicitud enviada.");
    });
  }

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
      <Input name="firstName" placeholder="Nombre completo" className="md:col-span-2" required />
      <Input name="email" placeholder="Correo electronico" type="email" required />
      <Input name="phone" placeholder="Telefono / WhatsApp" />
      <Input name="originCity" placeholder="Ciudad de origen" />
      <Input name="tentativeDate" placeholder="Fecha tentativa" type="date" />
      <Input
        name="packageSlug"
        defaultValue={selectedPackage}
        placeholder="Paquete seleccionado"
        className="md:col-span-2"
      />
      <Input name="adults" placeholder="Numero de adultos" type="number" defaultValue={2} />
      <Input name="minors" placeholder="Numero de menores" type="number" defaultValue={0} />
      <Textarea
        name="notes"
        className="md:col-span-2"
        placeholder="Detalles adicionales, presupuesto o preferencias"
        rows={5}
      />
      <Button className="md:col-span-2" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Enviando solicitud...
          </>
        ) : (
          "Solicitar cotizacion"
        )}
      </Button>
      {message ? <p className="md:col-span-2 text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
