"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { PasswordRules } from "./PasswordRules";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/utils/apiError";

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export function ResetPasswordForm({ initialEmail }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useMutation({
    mutationFn: () => authApi.resetPassword(email, otp, newPassword),
    onSuccess: () => router.replace("/login"),
    onError: (e) => setFormError(apiErrorMessage(e, "Code invalide ou expiré")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (otp.length !== 6) next.otp = "Code à 6 chiffres requis";
    if (newPassword.length < 8) next.newPassword = "8 caractères minimum";
    else if (!PWD_RE.test(newPassword))
      next.newPassword = "Majuscule, minuscule et chiffre requis";
    if (confirm !== newPassword)
      next.confirm = "Les mots de passe ne correspondent pas";

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length === 0) reset.mutate();
  };

  return (
    <AuthShell
      headline={
        <>
          Nouveau
          <br />
          mot de passe 🆕
        </>
      }
      sub="Saisissez le code reçu par email et définissez votre nouveau mot de passe."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {formError}
          </div>
        )}

        <Input
          label="Adresse email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Code de réinitialisation"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          error={errors.otp}
          className="text-center text-2xl font-extrabold tracking-[0.5em]"
        />

        <Input
          label="Nouveau mot de passe"
          type="password"
          placeholder="••••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
        />
        <PasswordRules value={newPassword} />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 rounded-md py-4 text-base tracking-[-.2px] shadow-[0_4px_20px_rgba(13,110,90,.3)]"
          loading={reset.isPending}
        >
          {reset.isPending ? "Réinitialisation…" : "Réinitialiser"}
        </Button>
      </form>
    </AuthShell>
  );
}
