"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { NotificationToaster } from "./NotificationToaster";
import { ToastHost } from "./ToastHost";
import { RouteProgress } from "./RouteProgress";
import { SocketSync } from "./SocketSync";
import { useAuthStore } from "@/lib/store/authStore";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 min
            gcTime: 1000 * 60 * 30, // 30 min
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Changement de session (login / logout / switch profil) → purge du cache.
  // Sinon un compte en succède un autre sur le même navigateur sans rechargement
  // et l'ancien cache (notifications, conversations, badge…) fuite vers le nouvel
  // utilisateur (on affiche les notifications de l'utilisateur précédent).
  const userId = useAuthStore((s) => s.user?.id);
  const accessToken = useAuthStore((s) => s.accessToken);
  const lastKey = `${accessToken ?? "anon"}:${userId ?? "anon"}`;
  const [sessionKey, setSessionKey] = useState(lastKey);

  useEffect(() => {
    if (sessionKey !== lastKey) {
      client.clear();
      setSessionKey(lastKey);
    }
  }, [lastKey, sessionKey, client]);

  return (
    <QueryClientProvider client={client}>
      <MotionConfig reducedMotion="user">
        <RouteProgress />
        <SocketSync />
        <NotificationToaster />
        <ToastHost />
        {children}
      </MotionConfig>
    </QueryClientProvider>
  );
}
