"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Image avec placeholder animé pendant le chargement puis fondu à l'arrivée.
 * Évite les « trous » et les sauts de mise en page : le conteneur garde ses
 * dimensions (classe `className` : aspect, hauteur…), l'image se révèle dessus.
 * Se masque si l'URL est absente ou si le chargement échoue.
 */
export function Photo({
  src,
  alt,
  className,
  imgClassName,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    setState("loading");
  }, [src]);

  if (!src || state === "error") return null;

  return (
    <div className={cn("relative overflow-hidden bg-surface-2", className)}>
      {state === "loading" && (
        <div className="absolute inset-0 animate-pulse bg-border/50" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        onLoad={() => setState("ok")}
        onError={() => setState("error")}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          state === "ok" ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
