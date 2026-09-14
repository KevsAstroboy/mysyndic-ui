"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useState } from "react";
import { feedApi, type CreateFeedInput } from "@/lib/api/feed";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import type { FeedPage } from "@/types/feed.types";

/** Publication d'un post + progression d'upload + insertion en tête du fil. */
export function useCreatePost() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (input: CreateFeedInput) => feedApi.create(input, setProgress),
    onSuccess: (created) => {
      setProgress(0);
      qc.setQueryData<InfiniteData<FeedPage>>(QUERY_KEYS.feedList(), (data) => {
        if (!data) return data;
        const pages = [...data.pages];
        if (pages[0]) {
          pages[0] = { ...pages[0], items: [created, ...pages[0].items] };
        }
        return { ...data, pages };
      });
    },
    onError: () => setProgress(0),
  });

  return { ...mutation, progress };
}
