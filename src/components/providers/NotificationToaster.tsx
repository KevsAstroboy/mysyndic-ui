"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useAuthStore } from "@/lib/store/authStore";

/** Événement window poussé par SocketSync dès qu'une notif/message arrive. */
export const NOTIFICATION_EVENT = "mysyndic:notification";

export function dispatchNotificationToast(detail: { titre: string; message?: string }) {
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail }));
}

/* ─── Son de notification (Web Audio, aucun asset) ─── */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (audioCtx === null) {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      audioCtx = Ctor ? new Ctor() : null;
    } catch {
      audioCtx = null;
    }
  }
  return audioCtx;
}

/**
 * iOS Safari : classe l'audio en session « playback » → le son n'est plus
 * coupé par le commutateur silencieux (comportement média). Sans support, no-op.
 */
function preferPlaybackSession() {
  try {
    const nav = navigator as unknown as {
      audioSession?: { type?: string };
    };
    if (nav.audioSession) nav.audioSession.type = "playback";
  } catch {
    /* non supporté */
  }
}

/**
 * Déverrouille l'audio au premier geste utilisateur (contrainte autoplay iOS).
 * On `resume()` ET on rejoue un buffer silencieux : sur iOS Safari c'est la
 * combinaison des deux qui garantit que le son sonnera ensuite, même hors
 * geste (à l'arrivée d'un socket).
 */
function unlockAudio() {
  preferPlaybackSession();
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined);
  }
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    /* silence */
  }
}

/** Petit "ding" à deux tons — bloqué silencieusement si l'autoplay le refuse. */
function playNotificationSound() {
  preferPlaybackSession();
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    const t0 = ctx.currentTime;
    const note = (freq: number, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      // Attaque nette, volume bien audible, chute douce.
      gain.gain.setValueAtTime(0.0001, t0 + start);
      gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.4), t0 + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0 + start);
      osc.stop(t0 + start + dur + 0.05);
    };
    // Carillon montant à trois notes — audible même avec un fond sonore.
    note(880, 0, 0.3, 0.5);
    note(1174.66, 0.11, 0.3, 0.45);
    note(1567.98, 0.22, 0.36, 0.4);
  } catch {
    /* silence */
  }
}

/* ─── Toaster global ─── */

interface ToastData {
  id: number;
  titre: string;
  message?: string;
}

/** Toast + son dès qu'une nouvelle notification (poll badge ou socket) arrive. */
export function NotificationToaster() {
  const { unreadCount, notifications } = useNotifications();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const prevUnreadRef = useRef(0);
  const idRef = useRef(0);
  const userId = useAuthStore((s) => s.user?.id);
  const prevUserId = useRef(userId);

  // Changement d'utilisateur (login/logout/switch) : on repart de zéro pour ne
  // JAMAIS rejouer/éroder les notifications du compte précédent sur celui-ci.
  useEffect(() => {
    if (prevUserId.current !== userId) {
      prevUserId.current = userId;
      prevUnreadRef.current = 0;
      setToasts([]);
    }
  }, [userId]);

  const remove = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const lastPushRef = useRef<{ key: string; at: number }>({ key: "", at: 0 });
  const lastSocketPushRef = useRef(0);

  const push = (titre: string, message?: string, fromSocket = false) => {
    const key = `${titre}|${message ?? ""}`;
    const now = Date.now();
    // Anti-doublon : le socket ET le repli badge peuvent signaler la même
    // notification à quelques secondes d'intervalle → un seul toast + un son.
    if (lastPushRef.current.key === key && now - lastPushRef.current.at < 8000) {
      return;
    }
    lastPushRef.current = { key, at: now };
    if (fromSocket) lastSocketPushRef.current = now;
    const toast: ToastData = { id: ++idRef.current, titre, message };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    playNotificationSound();
    window.setTimeout(() => remove(toast.id), 5600);
  };

  // Événement socket temps réel (source principale).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      push(detail.titre ?? "Nouvelle notification", detail.message, true);
    };
    window.addEventListener(NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
  }, []);

  // Repli (si le socket n'a rien poussé) : delta du badge non-lus.
  useEffect(() => {
    const prev = prevUnreadRef.current;
    const cur = unreadCount ?? 0;
    if (cur > prev && Date.now() - lastSocketPushRef.current > 8000) {
      const newest = [...(notifications.data ?? [])].sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      )[0];
      if (newest) push(newest.titre, newest.message);
    }
    prevUnreadRef.current = cur;
  }, [unreadCount, notifications.data]);

  // Déverrouille l'audio dès le premier geste (contrainte autoplay, iOS inclus).
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, {
      once: true,
      passive: true,
    });
    window.addEventListener("touchend", unlock, {
      once: true,
      passive: true,
    });
    // Retour au premier plan (iOS suspend l'audio en arrière-plan) : on re-arm.
    const onVisible = () => {
      if (document.visibilityState === "visible") unlockAudio();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("touchend", unlock);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            role="status"
            onClick={() => remove(t.id)}
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-[340px] items-start gap-2.5 rounded-md bg-surface p-3 shadow-float"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-accent">
              <Bell size={16} strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-ink">{t.titre}</div>
              {t.message && (
                <div className="mt-0.5 text-xs font-medium text-ink-2">
                  {t.message}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}