"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api/notification";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuthStore } from "@/lib/store/authStore";

/** Notifications + badge non lu (polling 60s, pas de socket côté backend). */
export function useNotifications() {
  const queryClient = useQueryClient();
  // Poll uniquement connecté — sinon le toaster global (monté aussi sur les
  // pages publiques /login…) ferait des appels 401 qui bouclent le reload.
  const accessToken = useAuthStore((s) => s.accessToken);
  // Tant que le mot de passe n'est pas changé, l'API répond 403 sur tout :
  // inutile de poller (et ça alimenterait la boucle de redirection).
  const mustChangePassword = useAuthStore(
    (s) => s.user?.must_change_password === true,
  );
  const enabled = !!accessToken && !mustChangePassword;

  const notifications = useQuery({
    queryKey: QUERY_KEYS.notifications(),
    queryFn: notificationApi.list,
    refetchInterval: 60_000,
    enabled,
  });

  const badge = useQuery({
    queryKey: QUERY_KEYS.notificationBadge(),
    queryFn: notificationApi.badge,
    refetchInterval: 60_000,
    enabled,
  });

  const unreadCount = badge.data?.count ?? 0;

  const markRead = async (id: string) => {
    await notificationApi.markRead(id);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationBadge() });
  };

  const readAll = async () => {
    await notificationApi.readAll();
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notificationBadge() });
  };

  return { notifications, unreadCount, markRead, readAll };
}
