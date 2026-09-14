"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "@/lib/api/feed";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";

const PAGE_SIZE = 20;

/** Fil de la cité — pagination par curseur (infinite scroll). */
export function useFeed() {
  const { citeId } = useAuth();
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feedList(),
    queryFn: ({ pageParam }) =>
      feedApi.list({ cursor: pageParam ?? undefined, limit: PAGE_SIZE }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next_cursor,
    enabled: !!citeId,
    staleTime: 30_000,
  });
}
