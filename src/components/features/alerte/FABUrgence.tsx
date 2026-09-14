"use client";

import { Zap } from "lucide-react";
import { useRef, useState } from "react";
import { AlerteSheet } from "./AlerteSheet";
import { alerteApi } from "@/lib/api/alerte";

const LONG_PRESS_MS = 2000;

/**
 * FAB urgence — mobile uniquement.
 * Clic court → ouvre l'AlerteSheet. Appui long 2 s → alerte silencieuse directe.
 *
 * Fiabilisé pour les mobiles/WebViews :
 *  - ouverture sur pointerup court ET sur click (fallback), jamais en double ;
 *  - pointer capture : un léger glissement ne doit pas annuler l'appui ;
 *  - appui long → alerte silencieuse, le relâchement n'ouvre PAS la feuille.
 */
export function FABUrgence() {
  const [open, setOpen] = useState(false);
  const pressStart = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silentSent = useRef(false);
  const opened = useRef(false);

  const startPress = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pressStart.current = Date.now();
    silentSent.current = false;
    opened.current = false;
    timer.current = setTimeout(() => {
      timer.current = null;
      silentSent.current = true;
      alerteApi.create({ silencieuse: true }).catch(() => {});
    }, LONG_PRESS_MS);
  };

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Relâchement → ouvre si appui court. `pointercancel` (scroll, geste système)
  // ne doit PAS ouvrir : sinon un simple scroll déclencherait la feuille.
  const releasePress = () => {
    const wasQuick =
      !silentSent.current && Date.now() - pressStart.current < LONG_PRESS_MS;
    clearTimer();
    if (wasQuick && !opened.current) {
      opened.current = true;
      setOpen(true);
    }
  };

  const handleClick = () => {
    // Appui long déjà envoyé → ne rien ouvrir.
    if (silentSent.current) {
      silentSent.current = false;
      return;
    }
    clearTimer();
    if (!opened.current) {
      opened.current = true;
      setOpen(true);
    }
  };

  return (
    <>
      <div
        className="fixed right-5 z-50 md:hidden"
        style={{ bottom: "calc(94px + env(safe-area-inset-bottom))" }}
      >
        <span className="pointer-events-none absolute -inset-1 animate-pulse-ring rounded-full border-2 border-danger" />
        <button
          onPointerDown={startPress}
          onPointerUp={releasePress}
          onPointerCancel={clearTimer}
          onClick={handleClick}
          aria-label="Signaler une urgence"
          className="relative flex h-14 w-14 touch-manipulation select-none items-center justify-center rounded-full bg-danger text-white shadow-fab"
        >
          <Zap size={24} strokeWidth={2} />
        </button>
      </div>
      <AlerteSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
