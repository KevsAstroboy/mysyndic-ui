"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBusyOverlay } from "./AuthBusyOverlay";
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
      footer={
        <p className="text-center text-[13px] font-medium text-ink-3">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-bold text-accent">
            Créer un compte
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-md bg-danger-soft px-3.5 py-3">
            <AlertCircle
              size={16}
              strokeWidth={2}
              className="mt-px shrink-0 text-danger"
            />
            <p className="text-xs font-semibold text-danger">{error}</p>
          </div>
        )}

        <Input
          label="Adresse email"
          type="text"
          placeholder="vous@email.com"
          autoComplete="email"
          leadingIcon={<Mail size={18} strokeWidth={1.7} />}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••••"
          autoComplete="current-password"
          leadingIcon={<Lock size={18} strokeWidth={1.7} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="pointer-events-auto text-ink-3 transition-colors hover:text-ink-2"
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
            className="text-[13px] font-bold text-accent"
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
      </form>

      <AuthBusyOverlay
        show={login.isPending}
        label="Connexion à votre cité…"
      />
    </AuthShell>
  );
}
