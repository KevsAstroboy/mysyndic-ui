"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthProfil, AuthResponse, AuthUser } from "@/types/auth.types";

const ACCESS_COOKIE = "access_token";

function setAccessCookie(token: string | null) {
  if (typeof document === "undefined") return;
  document.cookie = token
    ? `${ACCESS_COOKIE}=${token}; path=/; SameSite=Lax`
    : `${ACCESS_COOKIE}=; path=/; max-age=0`;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  profils: AuthProfil[];
  profilActif: AuthProfil | null;
  features: string[];
  citeId: string | null;
  lastUserProfilId: string | null;

  setSession: (data: AuthResponse) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  switchProfil: (profil: AuthProfil) => void;
  logout: () => void;
  setUser: (patch: Partial<AuthUser>) => void;

  hasFeature: (code: string) => boolean;
  isRole: (code: string) => boolean;
}

function resolveProfilActif(data: AuthResponse): AuthProfil | null {
  return (
    data.profils.find(
      (p) => p.userProfilId === data.profil_actif_user_profil_id,
    ) ??
    data.profils[0] ??
    null
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      profils: [],
      profilActif: null,
      features: [],
      citeId: null,
      lastUserProfilId: null,

      setSession: (data) => {
        const profilActif = resolveProfilActif(data);
        setAccessCookie(data.access_token);
        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          profils: data.profils,
          profilActif,
          features: data.features,
          citeId: profilActif?.citeId ?? null,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        setAccessCookie(accessToken);
        set({ accessToken, refreshToken });
      },

      switchProfil: (profil) => {
        set({
          profilActif: profil,
          citeId: profil.citeId ?? null,
          lastUserProfilId: profil.userProfilId,
        });
      },

      logout: () => {
        setAccessCookie(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          profils: [],
          profilActif: null,
          features: [],
          citeId: null,
        });
      },

      // Met à jour l'identité en session (après édition nom/prénom).
      setUser: (patch) => set((s) => ({ user: s.user ? { ...s.user, ...patch } : null })),

      hasFeature: (code) => get().features.includes(code),
      isRole: (code) => get().profilActif?.code === code,
    }),
    {
      name: "mysyndic-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) setAccessCookie(state.accessToken);
      },
    },
  ),
);
