"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApproveQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function approve() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/portal/quotes/${quoteId}/approve`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.order?.id) {
        setMessage(result.message ?? "No fue posible aprobar la cotizacion.");
        return;
      }

      router.push(`/portal/viajes/${result.order.id}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={approve} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          "Aprobar cotizacion y continuar"
        )}
      </Button>
      {message ? <p className="text-sm text-amber-600">{message}</p> : null}
    </div>
  );
}
