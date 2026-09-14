"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { FeedPost } from "@/types/feed.types";

function nameOf(auteur?: { prenom?: string; nom?: string } | null) {
  return `${auteur?.prenom ?? ""} ${auteur?.nom ?? ""}`.trim();
}

/** Aperçu des commentaires sur la card — limite la densité du fil. */
export function PostCommentsPreview({
  post,
  onOpenComments,
}: {
  post: FeedPost;
  onOpenComments: () => void;
}) {
  const previews = post.commentaires_preview ?? [];
  const total = post.commentaires_count;

  if (total === 0) {
    return (
      <button
        type="button"
        onClick={onOpenComments}
        className="w-full px-4 pb-3.5 pt-0.5 text-left text-[13px] font-medium text-ink-3 transition-colors hover:text-ink-2"
      >
        Ajouter un commentaire…
      </button>
    );
  }

  return (
    <div className="px-4 pb-3.5">
      {previews.map((c) => (
        <div key={c.id} className="flex items-start gap-2 py-0.5">
          <Avatar
            name={nameOf(c.auteur)}
            src={c.auteur?.photo_url ?? undefined}
            size={24}
          />
          <p className="min-w-0 flex-1 truncate text-[13px] leading-snug text-ink-2">
            <span className="font-bold text-ink">{nameOf(c.auteur)}</span>{" "}
            {c.texte}
          </p>
        </div>
      ))}
      {total > previews.length && (
        <button
          type="button"
          onClick={onOpenComments}
          className="mt-1 text-[13px] font-semibold text-ink-3 transition-colors hover:text-ink-2"
        >
          Voir les {total} commentaires
        </button>
      )}
    </div>
  );
}
