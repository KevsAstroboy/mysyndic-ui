"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Building2,
  ChevronRight,
  Globe,
  LogOut,
  Settings,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authStore";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { routeForRole } from "@/lib/utils/rbac";
import type { AuthProfil } from "@/types/auth.types";

interface ProfilMeta {
  icon: LucideIcon;
  style: string;
}

const PROFIL_META: Record<string, ProfilMeta> = {
  SUPER_ADMIN: {
    icon: Globe,
    style: "bg-gradient-to-br from-primary to-primary-dark text-white",
  },
  ADMIN: { icon: Settings, style: "bg-surface text-ink border border-primary" },
  SYNDIC: { icon: Building2, style: "bg-primary-light text-primary" },
  CHEF_SECURITE: { icon: Shield, style: "bg-[#0F1E2D] text-white" },
  HABITANT: { icon: User, style: "bg-surface text-ink border border-border" },
};

export function ProfilSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profils = useAuthStore((s) => s.profils);
  const lastUserProfilId = useAuthStore((s) => s.lastUserProfilId);
  const setSession = useAuthStore((s) => s.setSession);
  const switchProfil = useAuthStore((s) => s.switchProfil);
  const logout = useAuthStore((s) => s.logout);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...profils].sort((a, b) => {
    if (a.userProfilId === lastUserProfilId) return -1;
    if (b.userProfilId === lastUserProfilId) return 1;
    return a.orderPriority - b.orderPriority;
  });

  const switchCtx = useMutation({
    mutationFn: (profil: AuthProfil) => authApi.switchContext(profil.userProfilId),
    onSuccess: (data, profil) => {
      switchProfil(profil);
      setSession(data);
      router.replace(routeForRole(profil.code));
    },
    onError: (e) => setError(apiErrorMessage(e, "Changement d'espace impossible")),
  });

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">
            Bonjour {user?.prenom ?? ""} 👋
          </h1>
          <p className="mt-1 text-sm font-medium text-ink-3">
            Choisissez votre espace
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {sorted.map((profil) => {
            const meta = PROFIL_META[profil.code] ?? PROFIL_META.HABITANT;
            const Icon = meta.icon;
            const isPending = switchCtx.isPending && switchCtx.variables?.userProfilId === profil.userProfilId;
            return (
              <button
                key={profil.userProfilId}
                onClick={() => switchCtx.mutate(profil)}
                disabled={switchCtx.isPending}
                className={cn(
                  "flex items-center gap-4 rounded-md p-4 text-left shadow-card transition-transform active:scale-[.98]",
                  meta.style,
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-white/15">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold">{profil.libelle}</span>
                  {profil.citeNom && (
                    <span className="block text-xs font-medium opacity-70">
                      {profil.citeNom}
                    </span>
                  )}
                </span>
                {isPending ? (
                  <Spinner size={18} />
                ) : (
                  <ChevronRight size={20} strokeWidth={1.7} className="opacity-50" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-ink-3"
        >
          <LogOut size={16} strokeWidth={1.7} />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
