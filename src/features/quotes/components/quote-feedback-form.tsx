"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function QuoteFeedbackForm({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(action: "REQUEST_CHANGES" | "REJECT") {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/portal/quotes/${quoteId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          body,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible registrar tu respuesta.");
        return;
      }

      setBody("");
      setMessage(
        action === "REQUEST_CHANGES"
          ? "Tu solicitud de cambios ya fue enviada al admin."
          : "La cotización quedó marcada como descartada.",
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-slate-950">¿Necesitas ajustar algo?</p>
        <p className="mt-1 text-sm text-slate-600">
          Puedes pedir cambios en fechas, ocupación, hotel, vuelos o simplemente indicar que no continuarás con esta propuesta.
        </p>
      </div>
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={4}
        placeholder="Escribe aquí lo que quieres ajustar o el motivo por el que no continuarás."
      />
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => submit("REQUEST_CHANGES")}
        >
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Solicitar cambios"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
          onClick={() => submit("REJECT")}
        >
          No continuar con esta cotización
        </Button>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-amber-600">{error}</p> : null}
    </div>
  );
}
