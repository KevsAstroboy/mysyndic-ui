"use client";

import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { PasswordRules } from "./PasswordRules";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { useLogout } from "@/lib/hooks/useLogout";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { redirectAfterAuth } from "@/lib/utils/rbac";

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export function ChangePasswordForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useLogout();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const changePwd = useMutation({
    mutationFn: () => authApi.changePassword(oldPassword, newPassword),
    onSuccess: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const data = await authApi.refresh(refreshToken);
          setSession(data);
          router.replace(redirectAfterAuth(data));
          return;
        } catch {
          /* fallthrough */
        }
      }
      logout();
    },
    onError: (e) => setFormError(apiErrorMessage(e, "Impossible de changer le mot de passe")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!oldPassword) next.oldPassword = "Mot de passe temporaire requis";
    if (newPassword.length < 8) next.newPassword = "8 caractères minimum";
    else if (!PWD_RE.test(newPassword))
      next.newPassword = "Majuscule, minuscule et chiffre requis";
    if (confirm !== newPassword)
      next.confirm = "Les mots de passe ne correspondent pas";

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length === 0) changePwd.mutate();
  };

  return (
    <AuthShell
      headline={
        <>
          Créez votre
          <br />
          mot de passe 🔐
        </>
      }
      sub="Votre compte a été créé par l'administrateur. Définissez un mot de passe personnel pour continuer."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {formError && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {formError}
          </div>
        )}

        <div className="flex items-center gap-2.5 rounded-md bg-primary-light px-3.5 py-3">
          <Info size={18} strokeWidth={1.7} className="shrink-0 text-accent" />
          <p className="text-xs font-semibold text-accent">
            Mot de passe temporaire utilisé. Créez le vôtre pour accéder à
            l&apos;application.
          </p>
        </div>

        <Input
          label="Mot de passe temporaire"
          type="password"
          placeholder="••••••••••"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          error={errors.oldPassword}
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
          loading={changePwd.isPending}
        >
          {changePwd.isPending ? "Validation…" : "Valider et accéder"}
        </Button>

        <button
          type="button"
          onClick={() => {
            logout();
          }}
          className="text-center text-[13px] font-semibold text-ink-3"
        >
          Se déconnecter
        </button>
      </form>
    </AuthShell>
  );
}
