"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { useLikePost } from "@/lib/hooks/feed/useLikePost";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";
import type { FeedPost } from "@/types/feed.types";

export function PostActions({
  post,
  onOpenComments,
}: {
  post: FeedPost;
  onOpenComments: () => void;
}) {
  const { toggle, isPending } = useLikePost(post.id, post.liked_by_me);
  const reduced = usePrefersReducedMotion();

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={post.liked_by_me}
        aria-label={post.liked_by_me ? "Retirer le like" : "Liker"}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-bold transition-colors",
          post.liked_by_me
            ? "text-danger"
            : "text-ink-2 hover:text-ink",
        )}
      >
        <motion.span
          key={post.liked_by_me ? "on" : "off"}
          initial={reduced ? false : { scale: 0.7 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          className="flex"
        >
          <Heart
            size={19}
            strokeWidth={1.9}
            className={cn(post.liked_by_me && "fill-danger")}
          />
        </motion.span>
        {post.likes_count > 0 && post.likes_count}
      </button>

      <button
        type="button"
        onClick={onOpenComments}
        aria-label="Voir les commentaires"
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-bold text-ink-2 transition-colors hover:text-ink"
      >
        <MessageCircle size={19} strokeWidth={1.9} />
        {post.commentaires_count > 0 && post.commentaires_count}
      </button>
    </div>
  );
}
