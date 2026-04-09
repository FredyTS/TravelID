"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PublicQuoteRequestForm({
  selectedPackage,
  packageOptions,
}: {
  selectedPackage?: string;
  packageOptions: { slug: string; name: string; destination: string }[];
}) {
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
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="quote-name" className="text-sm font-medium text-slate-700">
          Nombre completo del titular
        </label>
        <Input id="quote-name" name="firstName" placeholder="Nombre completo" className="md:col-span-2" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="quote-email" className="text-sm font-medium text-slate-700">
          Correo electrónico
        </label>
        <Input id="quote-email" name="email" placeholder="Correo electronico" type="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="quote-phone" className="text-sm font-medium text-slate-700">
          Teléfono o WhatsApp
        </label>
        <Input id="quote-phone" name="phone" placeholder="Telefono / WhatsApp" />
      </div>
      <div className="space-y-2">
        <label htmlFor="quote-origin" className="text-sm font-medium text-slate-700">
          Ciudad de origen
        </label>
        <Input id="quote-origin" name="originCity" placeholder="Ciudad de origen" />
      </div>
      <div className="space-y-2">
        <label htmlFor="quote-date" className="text-sm font-medium text-slate-700">
          Fecha tentativa del viaje
        </label>
        <Input id="quote-date" name="tentativeDate" type="date" />
      </div>
      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium text-slate-700">Paquete base</label>
        <select
          name="packageSlug"
          defaultValue={selectedPackage}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
        >
          <option value="">Sin paquete base / viaje a medida</option>
          {packageOptions.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name} · {pkg.destination}
            </option>
          ))}
        </select>
      </div>
      <p className="md:col-span-2 text-xs text-slate-500">
        Si el paquete publicado no coincide con tu ciudad de salida, ocupación o fechas, aquí armamos la solicitud para recalcularlo.
      </p>
      <div className="space-y-2">
        <label htmlFor="quote-adults" className="text-sm font-medium text-slate-700">
          Número de adultos
        </label>
        <Input id="quote-adults" name="adults" type="number" min={1} defaultValue={2} />
      </div>
      <div className="space-y-2">
        <label htmlFor="quote-minors" className="text-sm font-medium text-slate-700">
          Número de menores
        </label>
        <Input id="quote-minors" name="minors" type="number" min={0} defaultValue={0} />
      </div>
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
