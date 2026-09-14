"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "@/lib/api/feed";
import { QUERY_KEYS } from "@/lib/api/queryKeys";

const PAGE_SIZE = 20;

/** Commentaires paginés d'un post (chargés à l'ouverture du panneau). */
export function useComments(postId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feedComments(postId),
    queryFn: ({ pageParam }) =>
      feedApi.comments(postId, {
        cursor: pageParam ?? undefined,
        limit: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
    enabled,
    staleTime: 30_000,
  });
}
