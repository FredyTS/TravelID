"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageComposer({
  endpoint,
  payload,
  placeholder,
  buttonLabel,
}: {
  endpoint: string;
  payload: Record<string, string | undefined>;
  placeholder: string;
  buttonLabel: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
    if (!body.trim()) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          body,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible enviar el mensaje.");
        return;
      }

      setBody("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        className="min-h-28 border-slate-200 bg-slate-50"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : <span className="text-sm text-slate-500">Las respuestas quedaran visibles en el historial del viaje.</span>}
        <Button onClick={onSubmit} disabled={isPending || !body.trim()}>
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 size-4" />
              {buttonLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
