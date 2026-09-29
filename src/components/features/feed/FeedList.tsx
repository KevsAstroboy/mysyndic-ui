"use client";

import { useEffect, useRef, useState } from "react";
import { Newspaper, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFeed } from "@/lib/hooks/feed/useFeed";
import { useComposerStore } from "@/lib/store/composerStore";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { CommentsSheet } from "./CommentsSheet";
import { CreatePostSheet } from "./CreatePostSheet";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "./PostSkeleton";
import type { FeedPost } from "@/types/feed.types";

function ComposerTrigger({ onClick }: { onClick: () => void }) {
  const { user } = useAuth();
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex w-full items-center gap-3 rounded-md bg-surface p-3.5 text-left shadow-card transition-colors hover:bg-surface-2"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-accent">
        <Plus size={18} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-3">
        Quoi de neuf, {user?.prenom ?? "voisin"} ?
      </span>
      <span className="hidden shrink-0 rounded-sm bg-primary px-3 py-1.5 text-[12px] font-bold text-white sm:block">
        Publier
      </span>
    </button>
  );
}

export function FeedList() {
  const feed = useFeed();
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  // Composer piloté globalement (topbar sticky, FAB, composer inline).
  const createOpen = useComposerStore((s) => s.feedComposerOpen);
  const openComposer = useComposerStore((s) => s.openFeedComposer);
  const closeComposer = useComposerStore((s) => s.closeFeedComposer);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const posts = (feed.data?.pages ?? []).flatMap((page) => page.items);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !feed.hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !feed.isFetchingNextPage) {
          void feed.fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [feed.hasNextPage, feed.isFetchingNextPage, feed.fetchNextPage]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 md:px-0">
      <ComposerTrigger onClick={openComposer} />

      {feed.isLoading ? (
        <div className="mt-3 space-y-3">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : feed.isError && posts.length === 0 ? (
        <div className="mt-3 rounded-md bg-surface p-6 text-center shadow-card">
          <p className="text-[13px] font-medium text-ink-2">
            {apiErrorMessage(
              feed.error,
              "Impossible de charger le fil pour le moment.",
            )}
          </p>
          <Button className="mt-4" onClick={() => void feed.refetch()}>
            Réessayer
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-3 rounded-md bg-surface shadow-card">
          <EmptyState
            icon={Newspaper}
            tone="teal"
            title="Le fil est vide"
            subtitle="Partagez une actualité, une photo ou une vidéo avec votre cité."
            action={
              <Button onClick={openComposer}>
                <Plus size={16} strokeWidth={2} />
                Créer une publication
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={setCommentPost}
            />
          ))}

          <div ref={sentinelRef} className="h-1" />
          {feed.isFetchingNextPage && (
            <div className="flex justify-center py-4 text-accent">
              <Spinner size={20} />
            </div>
          )}
          {!feed.hasNextPage && posts.length > 3 && (
            <p className="py-4 text-center text-[12px] font-medium text-ink-3">
              Vous êtes à jour.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={openComposer}
        aria-label="Nouvelle publication"
        className="fixed bottom-8 right-8 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-float transition-transform active:scale-95 md:flex"
      >
        <Plus size={26} strokeWidth={2} />
      </button>

      <CommentsSheet
        post={commentPost}
        open={!!commentPost}
        onClose={() => setCommentPost(null)}
      />
      <CreatePostSheet open={createOpen} onClose={closeComposer} />
    </div>
  );
}
