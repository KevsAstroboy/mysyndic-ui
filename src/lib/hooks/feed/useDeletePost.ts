"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { feedApi } from "@/lib/api/feed";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import type { FeedPage } from "@/types/feed.types";

/** Suppression d'un post — retire localement de toutes les pages du fil. */
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => feedApi.remove(postId),
    onSuccess: (_res, postId) => {
      qc.setQueryData<InfiniteData<FeedPage>>(
        QUERY_KEYS.feedList(),
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((p) => p.id !== postId),
            })),
          };
        },
      );
      qc.removeQueries({ queryKey: QUERY_KEYS.feedPost(postId) });
    },
  });
}
