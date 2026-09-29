"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Overlay plein écran pendant une action d'auth (login, inscription…).
 * L'utilisateur voit clairement qu'un processus est en cours avant le
 * changement de page, au lieu d'un « switch » silencieux.
 */
export function AuthBusyOverlay({
  show,
  label,
}: {
  show: boolean;
  label: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 bg-bg/85 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald text-xl font-extrabold text-white shadow-[0_8px_32px_rgba(13,110,90,.4)]"
          >
            MS
          </motion.div>
          <p className="text-sm font-bold text-ink">{label}</p>
          <Spinner size={22} className="text-accent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}