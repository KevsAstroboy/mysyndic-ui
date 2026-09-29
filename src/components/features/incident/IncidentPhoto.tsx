"use client";

import { feedMediaSrc } from "@/lib/utils/feedMedia";
import { Photo } from "@/components/ui/Photo";

/**
 * Photo d'un incident — chargée via le proxy same-origin de l'API
 * (`/api/files/preview`, authentifié par cookie), comme les médias du feed.
 * Placeholder animé pendant le chargement, masquée si absente/illisible.
 */
export function IncidentPhoto({
  path,
  className,
}: {
  path?: string | null;
  className?: string;
}) {
  const src = feedMediaSrc({ file_path: path });
  return <Photo src={src} alt="Photo de l'incident" className={className} />;
}
