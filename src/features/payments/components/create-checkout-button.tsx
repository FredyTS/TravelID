"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateCheckoutButton({
  orderId,
  scheduleId,
  label,
}: {
  orderId: string;
  scheduleId?: string;
  label?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function createCheckout() {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/orders/${orderId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        setError(result.message ?? "No fue posible iniciar el checkout.");
        return;
      }

      window.location.href = result.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button onClick={createCheckout} disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Redirigiendo...
          </>
        ) : (
          label ?? "Pagar con Stripe"
        )}
      </Button>
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}
    </div>
  );
}
