"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, SendHorizontal, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useComments } from "@/lib/hooks/feed/useComments";
import { useCreateComment } from "@/lib/hooks/feed/useCreateComment";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { feedMediaSrc } from "@/lib/utils/feedMedia";
import { toast } from "@/lib/utils/toast";
import { CommentItem } from "./CommentItem";
import type { FeedPost } from "@/types/feed.types";

export function CommentsSheet({
  post,
  open,
  onClose,
}: {
  post: FeedPost | null;
  open: boolean;
  onClose: () => void;
}) {
  const postId = post?.id ?? "";
  const comments = useComments(postId, open && !!postId);
  const create = useCreateComment(postId);
  const [texte, setTexte] = useState("");
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTexte("");
      setReplyTo(null);
      window.setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open]);

  const roots = (comments.data?.pages ?? []).flatMap((p) => p.items);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !comments.hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !comments.isFetchingNextPage) {
          void comments.fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    comments.hasNextPage,
    comments.isFetchingNextPage,
    comments.fetchNextPage,
  ]);

  const submit = () => {
    const value = texte.trim();
    if (!value || create.isPending) return;
    create.mutate(
      { texte: value, parentId: replyTo?.commentId ?? null },
      {
        onSuccess: (created) => {
          setTexte("");
          setReplyTo(null);
          const anchorId = created.parent_id ?? created.id;
          window.requestAnimationFrame(() => {
            document
              .getElementById(`feed-comment-${anchorId}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        },
        onError: (e) =>
          toast({
            titre: "Commentaire non envoyé",
            message: apiErrorMessage(e, "Une erreur est survenue"),
            tone: "error",
          }),
      },
    );
  };

  const total = post?.commentaires_count ?? 0;
  const authorName = `${post?.auteur?.prenom ?? ""} ${post?.auteur?.nom ?? ""}`.trim();
  const excerpt =
    post?.contenu?.trim() ||
    (post?.media_type === "VIDEO"
      ? "Vidéo"
      : post && post.media.length > 0
        ? "Photo"
        : "");

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={total > 0 ? `Commentaires · ${total}` : "Commentaires"}
    >
      {post && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-3">
          <Avatar
            name={authorName || "Habitant"}
            src={feedMediaSrc({
              file_path: post.auteur?.photo_file_path,
              url: post.auteur?.photo_url,
            })}
            size={34}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-ink">
              {authorName || "Habitant"}
            </div>
            {excerpt && (
              <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap break-words text-[12px] leading-snug text-ink-3">
                {excerpt}
              </p>
            )}
          </div>
        </div>
      )}

      {comments.isLoading ? (
        <div className="flex justify-center py-10 text-accent">
          <Spinner size={22} />
        </div>
      ) : roots.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          tone="teal"
          title="Aucun commentaire"
          subtitle="Lancez la discussion : soyez le premier à réagir."
        />
      ) : (
        <div className="divide-y divide-border/70">
          {roots.map((comment) => (
            <div key={comment.id} id={`feed-comment-${comment.id}`}>
              <CommentItem
                comment={comment}
                onReply={(target) => {
                  setReplyTo(target);
                  inputRef.current?.focus();
                }}
              />
            </div>
          ))}
          <div ref={sentinelRef} className="h-2" />
          {comments.isFetchingNextPage && (
            <div className="flex justify-center py-3 text-accent">
              <Spinner size={18} />
            </div>
          )}
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 mt-2 border-t border-border bg-surface/95 px-6 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 rounded-sm bg-primary-light px-3 py-1.5 text-[12px] font-semibold text-accent">
            <span className="min-w-0 flex-1 truncate">
              Réponse à {replyTo.authorName}
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              aria-label="Annuler la réponse"
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-primary/10"
            >
              <X size={13} strokeWidth={2.2} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={replyTo ? "Répondre…" : "Ajouter un commentaire…"}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border-[1.5px] border-border bg-surface-2 px-4 py-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent focus:bg-surface"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!texte.trim() || create.isPending}
            aria-label="Envoyer le commentaire"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-btn transition-transform active:scale-95 disabled:opacity-40 disabled:active:scale-100"
          >
            {create.isPending ? (
              <Spinner size={16} />
            ) : (
              <SendHorizontal size={18} strokeWidth={1.9} />
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
