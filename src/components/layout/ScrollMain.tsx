"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Zone de contenu scrollable de l'app shell.
 *
 * Le scroll est porté par ce conteneur (et non le body) pour que la sidebar
 * garde toute sa hauteur et que l'en-tête sticky reste collé en haut. Contraire-
 * ment au body, un conteneur interne n'est pas remis en haut par Next à chaque
 * navigation : on le fait donc explicitement sur changement de route.
 */
export function ScrollMain({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <main ref={ref} className={className}>
      {children}
    </main>
  );
}
