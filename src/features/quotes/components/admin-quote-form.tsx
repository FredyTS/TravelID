"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminQuoteForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const payload = {
        customerName: String(formData.get("customerName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        title: String(formData.get("title") ?? ""),
        packageSlug: String(formData.get("packageSlug") ?? ""),
        originCity: String(formData.get("originCity") ?? ""),
        departureDateTentative: String(formData.get("departureDateTentative") ?? ""),
        adults: Number(formData.get("adults") ?? 2),
        minors: Number(formData.get("minors") ?? 0),
        subtotal: Number(formData.get("subtotal") ?? 0),
        discountTotal: Number(formData.get("discountTotal") ?? 0),
        depositRequired: Number(formData.get("depositRequired") ?? 0),
        validUntil: String(formData.get("validUntil") ?? ""),
        customerNotes: String(formData.get("customerNotes") ?? ""),
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
    });
  }

  return (
    <form action={submit} className="grid gap-4 md:grid-cols-2">
      <Input name="title" placeholder="Titulo de la cotizacion" className="md:col-span-2" required />
      <Input name="customerName" placeholder="Nombre del cliente" required />
      <Input name="email" placeholder="Correo del cliente" type="email" required />
      <Input name="phone" placeholder="Telefono / WhatsApp" />
      <Input name="packageSlug" placeholder="Slug del paquete (opcional)" />
      <Input name="originCity" placeholder="Ciudad de origen" />
      <Input name="departureDateTentative" type="date" />
      <Input name="validUntil" type="date" />
      <Input name="adults" type="number" defaultValue={2} />
      <Input name="minors" type="number" defaultValue={0} />
      <Input name="subtotal" type="number" defaultValue={9990} />
      <Input name="discountTotal" type="number" defaultValue={0} />
      <Input name="depositRequired" type="number" defaultValue={3500} />
      <Textarea name="customerNotes" className="md:col-span-2" rows={5} placeholder="Notas visibles al cliente" />
      <Button className="md:col-span-2" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Creando cotizacion...
          </>
        ) : (
          "Crear cotizacion"
        )}
      </Button>
      {message ? <p className="md:col-span-2 text-sm text-amber-300">{message}</p> : null}
    </form>
  );
}
