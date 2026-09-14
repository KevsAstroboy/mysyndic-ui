"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { feedApi } from "@/lib/api/feed";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import type { FeedPage } from "@/types/feed.types";
import { patchFeedPost } from "./patchPost";

/**
 * Like/unlike optimiste. Le cache est mis à jour immédiatement puis réconcilié
 * avec la réponse serveur. Un clic pendant une requête en cours est ignoré
 * (évite les doubles requêtes).
 */
export function useLikePost(postId: string, liked: boolean) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? feedApi.like(postId) : feedApi.unlike(postId),
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.feedList() });
      const prev = qc.getQueryData<InfiniteData<FeedPage>>(
        QUERY_KEYS.feedList(),
      );
      patchFeedPost(qc, postId, (post) => ({
        ...post,
        liked_by_me: next,
        likes_count: Math.max(0, post.likes_count + (next ? 1 : -1)),
      }));
      return { prev };
    },
    onError: (_error, _next, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEYS.feedList(), ctx.prev);
    },
    onSuccess: (res) => {
      patchFeedPost(qc, postId, (post) => ({
        ...post,
        liked_by_me: res.liked,
        likes_count: res.likes_count,
      }));
    },
  });

  return {
    toggle: () => {
      if (mutation.isPending) return;
      mutation.mutate(!liked);
    },
    isPending: mutation.isPending,
  };
}
