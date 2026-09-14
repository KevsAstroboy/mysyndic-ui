"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { redirectAfterAuth } from "@/lib/utils/rbac";

export function ActivateForm({ initialEmail }: { initialEmail?: string }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const activate = useMutation({
    mutationFn: () => authApi.activate(email, otp),
    onSuccess: (data) => {
      setSession(data);
      router.replace(redirectAfterAuth(data));
    },
    onError: (e) => setError(apiErrorMessage(e, "Code invalide ou expiré")),
  });

  const resend = useMutation({
    mutationFn: () => authApi.resendActivation(email),
    onSuccess: () => setInfo("Code renvoyé par email."),
    onError: (e) => setError(apiErrorMessage(e, "Impossible de renvoyer le code")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    activate.mutate();
  };

  return (
    <AuthShell
      headline={
        <>
          Vérifiez
          <br />
          votre email ✉️
        </>
      }
      sub="Nous avons envoyé un code d'activation à 6 chiffres. Saisissez-le pour activer votre compte."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-md bg-emerald-soft px-3.5 py-3 text-xs font-semibold text-emerald">
            {info}
          </div>
        )}

        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Code d'activation"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="text-center text-2xl font-extrabold tracking-[0.5em]"
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 rounded-md py-4 text-base tracking-[-.2px] shadow-[0_4px_20px_rgba(13,110,90,.3)]"
          loading={activate.isPending}
        >
          {activate.isPending ? "Activation…" : "Activer mon compte"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            resend.mutate();
          }}
          disabled={resend.isPending}
          className="text-center text-[13px] font-semibold text-ink-3"
        >
          {resend.isPending ? "Envoi…" : "Renvoyer le code"}
        </button>
      </form>
    </AuthShell>
  );
}
