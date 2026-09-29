"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { patchFeedPost } from "@/lib/hooks/feed/patchPost";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { dispatchNotificationToast } from "./NotificationToaster";
import type { FeedPage } from "@/types/feed.types";

interface AlertePayload {
  alerte?: { villa?: { numero?: string } | null } | null;
  message_id?: string;
}

interface MessagePayload {
  expediteur_id?: string;
  contenu?: string;
}

interface FeedNewPayload {
  post_id?: string;
  auteur_id?: string;
}

interface FeedLikePayload {
  post_id?: string;
  user_id?: string;
  liked?: boolean;
  likes_count?: number;
}

interface FeedCommentPayload {
  post_id?: string;
  commentaire_id?: string;
  user_id?: string;
}

interface FeedDeletePayload {
  post_id?: string;
}

/**
 * Synchronisation temps réel (sprint 4) : messagerie + notifications.
 * Écoute les événements socket du backend et invalide le cache react-query.
 */
export function SocketSync() {
  const { accessToken, user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    // Mot de passe temporaire non changé : l'API bloque tout, inutile de
    // connecter le socket (évite les invalidations/rechargements en boucle).
    if (!accessToken || user?.must_change_password) {
      // Déconnexion / changement de compte : on coupe le socket pour ne plus
      // recevoir d'événements destinés à la session précédente.
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const onMessage = (payload?: MessagePayload) => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      // Pas de toast ici : le backend envoie AUSSI `notification:nouvelle`
      // pour le même message → sinon double notification (et double son).
      if (!payload) return;
    };
    const onNotification = (payload?: { titre?: string; message?: string }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notificationBadge() });
      dispatchNotificationToast({
        titre: payload?.titre ?? "Nouvelle notification",
        message: payload?.message,
      });
    };
    const onAlerte = () => {
      qc.invalidateQueries({ queryKey: ["alertes"] });
    };

    // Présence (messagerie) : rafraîchit les indicateurs en ligne/hors ligne.
    const onPresence = () => {
      qc.invalidateQueries({ queryKey: ["presence"] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations() });
    };

    const onFeedNew = (payload?: FeedNewPayload) => {
      if (payload?.auteur_id && payload.auteur_id === user?.id) return;
      qc.invalidateQueries({ queryKey: QUERY_KEYS.feedList() });
    };
    const onFeedLike = (payload?: FeedLikePayload) => {
      if (!payload?.post_id) return;
      if (payload.user_id === user?.id) return; // géré en optimiste
      patchFeedPost(qc, payload.post_id, (post) => ({
        ...post,
        likes_count: payload.likes_count ?? post.likes_count,
      }));
    };
    const onFeedComment = (payload?: FeedCommentPayload) => {
      if (!payload?.post_id) return;
      if (payload.user_id === user?.id) return; // géré en optimiste
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.feedComments(payload.post_id),
      });
      patchFeedPost(qc, payload.post_id, (post) => ({
        ...post,
        commentaires_count: post.commentaires_count + 1,
      }));
    };
    const onFeedDelete = (payload?: FeedDeletePayload) => {
      if (!payload?.post_id) return;
      qc.setQueryData<InfiniteData<FeedPage>>(
        QUERY_KEYS.feedList(),
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.filter((p) => p.id !== payload.post_id),
            })),
          };
        },
      );
    };

    socket.on("message:new", onMessage);
    socket.on("message:lu", onMessage);
    socket.on("notification:nouvelle", onNotification);
    socket.on("alerte:nouvelle", onAlerte);
    socket.on("alerte:statut", onAlerte);
    socket.on("alerte:escaladee", onAlerte);
    socket.on("presence:update", onPresence);
    socket.on("feed:nouveau", onFeedNew);
    socket.on("feed:like", onFeedLike);
    socket.on("feed:commentaire", onFeedComment);
    socket.on("feed:suppression", onFeedDelete);

    return () => {
      socket.off("message:new", onMessage);
      socket.off("message:lu", onMessage);
      socket.off("notification:nouvelle", onNotification);
      socket.off("alerte:nouvelle", onAlerte);
      socket.off("alerte:statut", onAlerte);
      socket.off("alerte:escaladee", onAlerte);
      socket.off("presence:update", onPresence);
      socket.off("feed:nouveau", onFeedNew);
      socket.off("feed:like", onFeedLike);
      socket.off("feed:commentaire", onFeedComment);
      socket.off("feed:suppression", onFeedDelete);
    };
  }, [accessToken, qc, user?.id, user?.must_change_password]);

  useEffect(() => () => disconnectSocket(), []);

  return null;
}
