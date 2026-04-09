"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const email = formData.get("email");
      const password = formData.get("password");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("No fue posible iniciar sesion con esas credenciales.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <Input name="email" placeholder="Email" type="email" autoComplete="email" required />
      <Input
        name="password"
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
