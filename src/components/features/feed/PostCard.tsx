"use client";

import { memo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { useDeletePost } from "@/lib/hooks/feed/useDeletePost";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "@/lib/utils/toast";
import { PostActions } from "./PostActions";
import { PostCommentsPreview } from "./PostCommentsPreview";
import { PostContent } from "./PostContent";
import { PostHeader } from "./PostHeader";
import { PostMedia } from "./PostMedia";
import type { FeedPost } from "@/types/feed.types";

function PostCardComponent({
  post,
  onOpenComments,
}: {
  post: FeedPost;
  onOpenComments: (post: FeedPost) => void;
}) {
  const { user, hasFeature } = useAuth();
  const del = useDeletePost();
  const [confirm, setConfirm] = useState(false);

  const canDelete =
    post.auteur_id === user?.id || hasFeature("FEED_MODERATE");
  const authorName =
    `${post.auteur?.prenom ?? ""} ${post.auteur?.nom ?? ""}`.trim() ||
    "Habitant";

  const handleDelete = () => {
    del.mutate(post.id, {
      onSuccess: () => {
        setConfirm(false);
        toast({ titre: "Publication supprimée", tone: "success" });
      },
      onError: (e) => {
        setConfirm(false);
        toast({
          titre: "Suppression impossible",
          message: apiErrorMessage(e, "Une erreur est survenue"),
          tone: "error",
        });
      },
    });
  };

  return (
    <article className="rounded-md bg-surface shadow-card">
      <PostHeader
        post={post}
        canDelete={canDelete}
        onDelete={() => setConfirm(true)}
      />
      <PostContent texte={post.contenu} />
      <div className="px-1">
        <PostMedia media={post.media} authorName={authorName} />
      </div>
      <PostActions post={post} onOpenComments={() => onOpenComments(post)} />
      <PostCommentsPreview
        post={post}
        onOpenComments={() => onOpenComments(post)}
      />

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={handleDelete}
        loading={del.isPending}
        title="Supprimer la publication"
        message="Cette publication sera retirée du fil. Action irréversible."
      />
    </article>
  );
}

export const PostCard = memo(PostCardComponent);
