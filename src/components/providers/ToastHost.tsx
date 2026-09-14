"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastInput, type ToastTone } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";

interface ToastItem extends ToastInput {
  id: number;
}

const TONES: Record<ToastTone, { icon: LucideIcon; cls: string }> = {
  info: { icon: Info, cls: "bg-primary-light text-primary" },
  success: { icon: CheckCircle2, cls: "bg-emerald-soft text-emerald" },
  error: { icon: AlertTriangle, cls: "bg-danger-soft text-danger" },
};

/** Toaster générique (actions feed) — distinct de `NotificationToaster`. */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastInput>).detail ?? {};
      if (!detail.titre) return;
      const item: ToastItem = {
        id: ++idRef.current,
        titre: detail.titre,
        message: detail.message,
        tone: detail.tone ?? "info",
      };
      setItems((prev) => [item, ...prev].slice(0, 3));
      window.setTimeout(
        () => setItems((prev) => prev.filter((t) => t.id !== item.id)),
        4600,
      );
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence>
        {items.map((t) => {
          const tone = TONES[t.tone ?? "info"];
          const Icon = tone.icon;
          return (
            <motion.div
              key={t.id}
              role="status"
              onClick={() =>
                setItems((prev) => prev.filter((x) => x.id !== t.id))
              }
              initial={{ y: -20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto flex w-full max-w-[360px] items-start gap-2.5 rounded-md bg-surface p-3 shadow-float"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  tone.cls,
                )}
              >
                <Icon size={16} strokeWidth={1.7} />
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
          );
        })}
      </AnimatePresence>
    </div>
  );
}
