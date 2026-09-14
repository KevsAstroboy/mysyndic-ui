"use client";

import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { redirectAfterAuth } from "@/lib/utils/rbac";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: () => authApi.login(identifier, password),
    onSuccess: (data) => {
      setSession(data);
      router.replace(redirectAfterAuth(data));
    },
    onError: (e) => setError(apiErrorMessage(e, "Identifiants invalides")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate();
  };

  return (
    <AuthShell
      headline={
        <>
          Bon retour dans
          <br />
          votre cité 👋
        </>
      }
      sub="Connectez-vous pour accéder à votre espace et gérer votre cotisation."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <Input
          label="Adresse email"
          type="text"
          placeholder="vous@email.com"
          autoComplete="email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="pointer-events-auto text-ink-3"
              aria-label="Afficher le mot de passe"
            >
              {showPwd ? (
                <EyeOff size={18} strokeWidth={1.7} />
              ) : (
                <Eye size={18} strokeWidth={1.7} />
              )}
            </button>
          }
        />

        <div className="-mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-[13px] font-bold text-primary"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 rounded-md py-4 text-base tracking-[-.2px] shadow-[0_4px_20px_rgba(13,110,90,.3)]"
          loading={login.isPending}
        >
          {login.isPending ? "Connexion…" : "Se connecter"}
        </Button>

        <div className="flex items-center gap-3 text-xs font-semibold text-ink-3">
          <span className="h-px flex-1 bg-border" />
          ou
          <span className="h-px flex-1 bg-border" />
        </div>

        <p className="text-center text-[13px] font-medium text-ink-3">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-bold text-primary">
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
