"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/axios";

export const AVATAR_QUERY_KEY = ["users", "me", "photo"];

/**
 * Avatar de l'utilisateur connecté, partagé par tous les rendus (sidebar,
 * topbar, profil). Cache react-query : un seul appel ; les composants qui
 * veulent rafraîchir après upload invalident AVATAR_QUERY_KEY.
 */
export function useUserAvatar(): string | undefined {
  const { data: blob } = useQuery({
    queryKey: AVATAR_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get("/users/me/photo", { responseType: "blob" });
        const b = res.data as Blob;
        return b && b.size > 0 ? b : null;
      } catch (e) {
        // 404 = pas encore de photo → null (initiales affichées).
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    let active = true;
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => {
      active = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);

  return url;
}

/**
 * Affiche une image PROTÉGÉE par JWT (ex : photo de profil, photos d'alertes).
 * Un <img src="/api/..."> ne peut pas envoyer le header Authorization → 401.
 * Ici on charge le blob via axios (qui injecte le token) puis objectURL.
 *
 * @param path chemin API (sans préfixe /api), ex "/users/me/photo"
 * @param dep valeur qui force un rechargement quand elle change
 */
export function useAuthedImage(
  path: string | null | undefined,
  dep?: unknown,
): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!path) {
      setUrl(undefined);
      return;
    }
    let active = true;
    let objectUrl: string | null = null;
    setUrl(undefined);

    api
      .get(path, { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        const data = res.data as Blob;
        if (data && data.size > 0) {
          objectUrl = URL.createObjectURL(data);
          setUrl(objectUrl);
        }
      })
      .catch(() => {
        /* silencieux : pas de photo, on garde les initiales */
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, dep]);

  return url;
}

/** <img> protégé : charge en blob et affiche. */
export function AuthedImage({
  path,
  dep,
  alt,
  className,
}: {
  path: string | null | undefined;
  dep?: unknown;
  alt?: string;
  className?: string;
}) {
  const url = useAuthedImage(path, dep);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt ?? ""} className={className} />;
}