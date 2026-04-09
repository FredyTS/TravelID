"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConvertQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function convert() {
    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/admin/quotes/${quoteId}/convert`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message ?? "No fue posible convertir la cotizacion.");
        return;
      }

      router.push(`/admin/orders/${result.order.id}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={convert} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Convirtiendo...
          </>
        ) : (
          "Convertir a pedido"
        )}
      </Button>
      {message ? <p className="text-sm text-amber-300">{message}</p> : null}
    </div>
  );
}
