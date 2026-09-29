"use client";

import { useEffect } from "react";
import { effectiveDark, useThemeStore } from "@/lib/store/themeStore";

const THEME_COLOR_LIGHT = "#0D6E5A";
const THEME_COLOR_DARK = "#0A1218";

function apply(resolved: boolean) {
  document.documentElement.classList.toggle("dark", resolved);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
}

/** Applique le mode nuit sur <html> (classe .dark) + theme-color iOS. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dark = useThemeStore((s) => s.dark);

  // Classe déjà posée par le script inline anti-flash ; on resynchronise après hydration.
  useEffect(() => {
    apply(effectiveDark(dark));
  }, [dark]);

  // En mode système, réagit aux changements d'OS en direct.
  useEffect(() => {
    if (dark !== null) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [dark]);

  return <>{children}</>;
}
