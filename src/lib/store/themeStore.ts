"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  /** null = suit le système (prefers-color-scheme). true/false = choix explicite persisté. */
  dark: boolean | null;
  toggle: () => void;
  setDark: (v: boolean) => void;
  followSystem: () => void;
}

/** Thème global — mode nuit de toute l'app. */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: null,
      toggle: () =>
        set((s) => ({ dark: !effectiveDark(s.dark) })),
      setDark: (v) => set({ dark: v }),
      followSystem: () => set({ dark: null }),
    }),
    { name: "mysyndic-theme" },
  ),
);

/** Résout null → préférence système. Utilisable côté navigateur uniquement. */
export function effectiveDark(dark: boolean | null): boolean {
  if (dark !== null) return dark;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
