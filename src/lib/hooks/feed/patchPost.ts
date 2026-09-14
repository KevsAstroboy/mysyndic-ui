import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import type { FeedPage, FeedPost } from "@/types/feed.types";

/**
 * Applique une mise à jour locale d'un post dans TOUTES les pages du feed infini
 * (et dans le cache détail), sans refetch. C'est le socle des likes/commentaires
 * optimistes : une seule source de vérité (le cache React Query).
 */
export function patchFeedPost(
  qc: QueryClient,
  postId: string,
  updater: (post: FeedPost) => FeedPost,
) {
  qc.setQueryData<InfiniteData<FeedPage>>(QUERY_KEYS.feedList(), (data) => {
    if (!data) return data;
    let changed = false;
    const pages = data.pages.map((page) => {
      if (!page.items.some((p) => p.id === postId)) return page;
      changed = true;
      return {
        ...page,
        items: page.items.map((p) => (p.id === postId ? updater(p) : p)),
      };
    });
    return changed ? { ...data, pages } : data;
  });

  qc.setQueryData<FeedPost>(QUERY_KEYS.feedPost(postId), (post) =>
    post ? updater(post) : post,
  );
}
