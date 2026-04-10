"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CustomerAccessForm({ callbackUrl = "/portal" }: { callbackUrl?: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    setSentTo(null);

    startTransition(async () => {
      const email = String(formData.get("email") ?? "").trim().toLowerCase();

      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("No fue posible enviar tu acceso. Intenta de nuevo en unos minutos.");
        return;
      }

      setSentTo(email);
    });
  }

  return (
    <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Cliente</h3>
        <p className="mt-1 text-sm text-slate-600">
          Entra con tu email y te enviaremos un acceso seguro para ver tu reserva, pagos y mensajes.
        </p>
      </div>
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="customer-access-email" className="text-sm font-medium text-slate-700">
            Correo con el que hiciste tu reserva o cotización
          </label>
          <Input
            id="customer-access-email"
            name="email"
            placeholder="tu-correo@ejemplo.com"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <Button className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Enviando acceso...
            </>
          ) : (
            "Recibir acceso por email"
          )}
        </Button>
      </form>
      {sentTo ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-center gap-2 font-medium">
            <MailCheck className="size-4" />
            Te enviamos un enlace a {sentTo}
          </div>
          <p className="mt-1 text-emerald-700/80">
            Revisa tu correo y entra directo a tu portal. Si no lo ves, intenta de nuevo en un par de minutos.
          </p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
