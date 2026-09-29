"use client";

import { useEffect, useState } from "react";

/**
 * Indique si le viewport correspond au breakpoint `md` (≥ 768px).
 * Utilisé pour basculer un même composant entre rendu mobile et desktop.
 */
export function useIsDesktop(query = "(min-width: 768px)") {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return isDesktop;
}
