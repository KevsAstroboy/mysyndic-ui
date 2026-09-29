"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/utils/apiError";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const forgot = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => router.replace(`/reset-password?email=${encodeURIComponent(email)}`),
    onError: (e) => setError(apiErrorMessage(e, "Impossible d'envoyer le code")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    forgot.mutate();
  };

  return (
    <AuthShell
      headline={
        <>
          Mot de passe
          <br />
          oublié 🔑
        </>
      }
      sub="Saisissez votre email. Nous vous enverrons un code pour réinitialiser votre mot de passe."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 rounded-md py-4 text-base tracking-[-.2px] shadow-[0_4px_20px_rgba(13,110,90,.3)]"
          loading={forgot.isPending}
        >
          {forgot.isPending ? "Envoi…" : "Envoyer le code"}
        </Button>

        <p className="text-center text-[13px] font-medium text-ink-3">
          <Link href="/login" className="font-bold text-accent">
            Retour à la connexion
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
