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
      audioCtx = new AudioContext();
    } catch {
      audioCtx = null;
    }
  }
  return audioCtx;
}

/** À appeler au premier geste utilisateur (déverrouille l'autoplay navigateur). */
function warmUpAudio() {
  const ctx = getAudioCtx();
  if (!ctx || ctx.state === "suspended") {
    try {
      void ctx?.resume();
    } catch {
      /* silence */
    }
  }
}

/** Petit "ding" à deux tons — bloqué silencieusement si l'autoplay le refuse. */
function playNotificationSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();
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

  const push = (titre: string, message?: string) => {
    const toast: ToastData = { id: ++idRef.current, titre, message };
    setToasts((prev) => [toast, ...prev].slice(0, 3));
    playNotificationSound();
    window.setTimeout(() => remove(toast.id), 5600);
  };

  // Événement socket temps réel (ou repli polling : delta du badge).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? {};
      push(detail.titre ?? "Nouvelle notification", detail.message);
    };
    window.addEventListener(NOTIFICATION_EVENT, handler);
    return () => window.removeEventListener(NOTIFICATION_EVENT, handler);
  }, []);

  useEffect(() => {
    const prev = prevUnreadRef.current;
    const cur = unreadCount ?? 0;
    if (cur > prev) {
      const newest = (notifications.data ?? [])[0];
      if (newest) push(newest.titre, newest.message);
    }
    prevUnreadRef.current = cur;
  }, [unreadCount, notifications.data]);

  // Déverrouille l'audio dès le premier geste (contrainte autoplay navigateur).
  useEffect(() => {
    window.addEventListener("pointerdown", warmUpAudio, { once: true });
    window.addEventListener("keydown", warmUpAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", warmUpAudio);
      window.removeEventListener("keydown", warmUpAudio);
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
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