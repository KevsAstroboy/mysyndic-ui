"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

/**
 * Avatar avec dégradé progressif : les initiales s'affichent immédiatement,
 * la photo vient par-dessus en fondu une fois chargée. Plus d'avatar vide
 * pendant le chargement, et repli sur les initiales si l'image échoue.
 */
export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const showImg = !!src && !failed;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-emerald text-sm font-extrabold text-white shadow-[0_2px_8px_rgba(13,110,90,.25)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-label={name}
    >
      <span className="select-none" aria-hidden={showImg}>
        {initials(name ?? "?")}
      </span>
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? ""}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
