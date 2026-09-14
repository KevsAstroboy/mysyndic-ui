"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Barre de progression globale affichée lors d'une navigation (clic sur un
 * lien). Feedback visuel immédiat tant que la prochaine page n'est pas prête.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname);

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 250);
  };

  // Navigation par lien interne (href relatif) → on montre la barre.
  useEffect(() => {
    const onGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.("a");
      if (!target) return;
      const href = (target as HTMLAnchorElement).getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const a = target as HTMLAnchorElement;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (a.href === window.location.href) return;
      setVisible(true);
    };
    document.addEventListener("click", onGlobalClick);
    return () => document.removeEventListener("click", onGlobalClick);
  }, []);

  // La route a changé → on masque la barre.
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      hide();
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, scaleX: 0 }}
          animate={{ scaleX: 1, transition: { duration: 0.6, ease: "easeOut" } }}
          exit={{ opacity: 0 }}
          className="fixed inset-x-0 top-0 z-[80] h-0.5 origin-left bg-primary"
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
