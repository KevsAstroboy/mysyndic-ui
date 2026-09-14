"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user";
import { QUERY_KEYS } from "@/lib/api/queryKeys";

/** Villa courante de l'habitant connecté (via GET /users/me). */
export function useCurrentVilla() {
  return useQuery({
    queryKey: QUERY_KEYS.me(),
    queryFn: userApi.me,
    staleTime: 1000 * 60 * 5,
  });
}
