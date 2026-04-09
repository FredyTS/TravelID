"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RegisterQuoteProposalButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const response = await fetch(`/api/admin/quotes/${quoteId}/proposal-document`, {
              method: "POST",
            });
            const result = await response.json();

            if (!response.ok) {
              setMessage(result.message ?? "No fue posible publicar el PDF.");
              return;
            }

            setMessage("PDF publicado en documentos.");
            router.refresh();
          });
        }}
      >
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Publicando PDF...
          </>
        ) : (
          "Publicar PDF en documentos"
        )}
      </Button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  );
}
