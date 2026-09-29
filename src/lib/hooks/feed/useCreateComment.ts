"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { feedApi } from "@/lib/api/feed";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import type { CommentsPage } from "@/types/feed.types";
import { patchFeedPost } from "./patchPost";

/**
 * Création d'un commentaire (racine ou réponse) avec insertion optimiste dans
 * le panneau + mise à jour locale du compteur du post (pas de refetch du feed).
 */
export function useCreateComment(postId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: { texte: string; parentId?: string | null }) =>
      input.parentId
        ? feedApi.reply(postId, input.parentId, input.texte)
        : feedApi.addComment(postId, input.texte),
    onSuccess: (created) => {
      qc.setQueryData<InfiniteData<CommentsPage>>(
        QUERY_KEYS.feedComments(postId),
        (data) => {
          if (!data) return data;
          const pages = data.pages.map((page) => ({
            ...page,
            items: [...page.items],
          }));

          if (created.parent_id) {
            for (const page of pages) {
              const parent = page.items.find((c) => c.id === created.parent_id);
              if (parent) {
                parent.reponses = [
                  { ...created, reponses: [] },
                  ...(parent.reponses ?? []),
                ];
                return { ...data, pages };
              }
            }
            return data;
          }

          // Les commentaires sont triés du plus récent au plus vieux : le nouveau
          // arrive en tête de la première page.
          const first = pages[0];
          if (first) {
            first.items = [{ ...created, reponses: [] }, ...first.items];
          }
          return { ...data, pages };
        },
      );

      patchFeedPost(qc, postId, (post) => ({
        ...post,
        commentaires_count: post.commentaires_count + 1,
      }));
    },
  });
}
