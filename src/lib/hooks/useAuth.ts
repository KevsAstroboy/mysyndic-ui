"use client";

import { useAuthStore } from "@/lib/store/authStore";

/** Hook d'accès à la session auth (sélecteurs granulaires). */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const profils = useAuthStore((s) => s.profils);
  const profilActif = useAuthStore((s) => s.profilActif);
  const features = useAuthStore((s) => s.features);
  const citeId = useAuthStore((s) => s.citeId);
  const accessToken = useAuthStore((s) => s.accessToken);

  const setSession = useAuthStore((s) => s.setSession);
  const setTokens = useAuthStore((s) => s.setTokens);
  const switchProfil = useAuthStore((s) => s.switchProfil);
  const logout = useAuthStore((s) => s.logout);
  const hasFeature = useAuthStore((s) => s.hasFeature);
  const isRole = useAuthStore((s) => s.isRole);

  return {
    user,
    profils,
    profilActif,
    features,
    citeId,
    accessToken,
    setSession,
    setTokens,
    switchProfil,
    logout,
    hasFeature,
    isRole,
  };
}
