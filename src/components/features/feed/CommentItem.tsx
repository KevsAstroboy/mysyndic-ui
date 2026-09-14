"use client";

import { CornerDownRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelative } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";
import type { FeedComment } from "@/types/feed.types";

function nameOf(auteur?: { prenom?: string; nom?: string } | null) {
  return `${auteur?.prenom ?? ""} ${auteur?.nom ?? ""}`.trim() || "Habitant";
}

export function CommentItem({
  comment,
  depth = 1,
  rootId,
  onReply,
}: {
  comment: FeedComment;
  depth?: 1 | 2;
  rootId?: string;
  onReply: (target: { commentId: string; authorName: string }) => void;
}) {
  const name = nameOf(comment.auteur);
  const targetRoot = depth === 2 ? rootId ?? comment.id : comment.id;

  return (
    <div className={cn(depth === 2 && "ml-9")}>
      <div className="flex items-start gap-2.5 py-2">
        <Avatar name={name} src={comment.auteur?.photo_url ?? undefined} size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[13px] font-bold text-ink">
              {name}
            </span>
            <span className="shrink-0 text-[11px] font-medium text-ink-3">
              {formatRelative(comment.created_at ?? "")}
            </span>
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-snug text-ink-2">
            {comment.texte}
          </p>
          <button
            type="button"
            onClick={() => onReply({ commentId: targetRoot, authorName: name })}
            className="mt-1 flex items-center gap-1 text-[11px] font-bold text-ink-3 transition-colors hover:text-primary"
          >
            <CornerDownRight size={12} strokeWidth={2} />
            Répondre
          </button>
        </div>
      </div>

      {depth === 1 && (comment.reponses ?? []).length > 0 && (
        <div className="border-l-2 border-border pl-0">
          {(comment.reponses ?? []).map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={2}
              rootId={comment.id}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
