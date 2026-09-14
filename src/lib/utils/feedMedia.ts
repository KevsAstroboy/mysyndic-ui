import { API_BASE } from "@/lib/api/axios";
import type { MediaMeta } from "@/types/feed.types";

/**
 * Source d'affichage d'un média de feed.
 *
 * On passe par le proxy same-origin de l'API (`/api/files/preview`) plutôt que
 * par une URL MinIO pré-signée : plus aucune dépendance à un hostname/port MinIO
 * joignable par le navigateur (Docker interne, LAN, téléphone…). Le cookie
 * `access_token` authentifie la requête, et le proxy gère le HTTP Range (seek).
 * Fallback sur `url` si le `file_path` n'est pas exposé.
 */
export function feedMediaSrc(media: {
  url?: string | null;
  file_path?: string | null;
}): string | undefined {
  if (media.file_path) {
    return `${API_BASE}/api/files/preview?path=${encodeURIComponent(media.file_path)}`;
  }
  return media.url ?? undefined;
}

/** Lit largeur/hauteur d'une image (navigateur) sans la charger en mémoire lourde. */
export async function readImageMeta(file: File): Promise<MediaMeta> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image illisible"));
    });
    return {
      largeur: img.naturalWidth || null,
      hauteur: img.naturalHeight || null,
    };
  } catch {
    return { largeur: null, hauteur: null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Lit largeur/hauteur/durée d'une vidéo via les métadonnées du navigateur. */
export async function readVideoMeta(file: File): Promise<MediaMeta> {
  const url = URL.createObjectURL(file);
  // Certains navigateurs (surtout mobiles) n'émettent `loadedmetadata` que si
  // l'élément vidéo est réellement attaché au DOM. On le monte donc, invisible.
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.style.position = "fixed";
  video.style.width = "1px";
  video.style.height = "1px";
  video.style.opacity = "0";
  video.style.pointerEvents = "none";
  document.body.appendChild(video);
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(
        () => reject(new Error("Métadonnées vidéo indisponibles")),
        8000,
      );
      // Les listeners sont posés AVANT `src` : plus de course possible.
      video.addEventListener(
        "loadedmetadata",
        () => {
          window.clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
      video.addEventListener(
        "error",
        () => {
          window.clearTimeout(timer);
          reject(new Error("Vidéo illisible"));
        },
        { once: true },
      );
      video.src = url;
      video.load();
    });
    const duration = Number.isFinite(video.duration)
      ? Math.round(video.duration)
      : null;
    return {
      largeur: video.videoWidth || null,
      hauteur: video.videoHeight || null,
      duree_sec: duration,
    };
  } catch {
    return { largeur: null, hauteur: null, duree_sec: null };
  } finally {
    video.remove();
    URL.revokeObjectURL(url);
  }
}
