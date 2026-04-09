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
      <div className="space-y-2">
        <label htmlFor="admin-email" className="text-sm font-medium text-slate-700">
          Correo del administrador
        </label>
        <Input id="admin-email" name="email" placeholder="admin@alondratravelmx.com" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-password" className="text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <Input
          id="admin-password"
          name="password"
          placeholder="Escribe tu contraseña"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
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
