"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ShareLinkPanel({
  endpoint,
  defaultEmail,
  shareLabel,
  copyLabel,
}: {
  endpoint: string;
  defaultEmail?: string | null;
  shareLabel: string;
  copyLabel: string;
}) {
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(action: "preview" | "send") {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          recipientEmail,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message ?? "No fue posible completar la acción.");
        return;
      }

      if (action === "preview" && result.shareUrl) {
        await navigator.clipboard.writeText(result.shareUrl);
        setMessage("El link de seguimiento ya se copió al portapapeles.");
        return;
      }

      setMessage(`Listo. El link fue enviado a ${recipientEmail || "el correo configurado"}.`);
    });
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Correo destinatario</label>
        <Input
          type="email"
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          placeholder="cliente@correo.com"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending || !recipientEmail.trim()} onClick={() => runAction("send")}>
          {isPending ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            shareLabel
          )}
        </Button>
        <Button variant="outline" disabled={isPending} onClick={() => runAction("preview")}>
          {copyLabel}
        </Button>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-amber-600">{error}</p> : null}
    </div>
  );
}
