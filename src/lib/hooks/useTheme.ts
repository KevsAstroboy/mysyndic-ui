"use client";

import { useEffect, useState } from "react";
import { effectiveDark, useThemeStore } from "@/lib/store/themeStore";

/** Thème effectif (système résolu) + état d'hydration pour éviter les mismatch SSR. */
export function useTheme() {
  const dark = useThemeStore((s) => s.dark);
  const toggle = useThemeStore((s) => s.toggle);
  const setDark = useThemeStore((s) => s.setDark);
  const followSystem = useThemeStore((s) => s.followSystem);

  // Évite le mismatch SSR sur les icônes Soleil/Lune (rendu conditionnel client).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return {
    dark: effectiveDark(dark),
    toggle,
    setDark,
    followSystem,
    mounted,
  };
}
