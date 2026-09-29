"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
  exit: { y: "100%", transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } },
};

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center md:p-4">
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-overlay/40"
            onClick={onClose}
          />
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[28px] bg-surface pb-[env(safe-area-inset-bottom)] shadow-float md:relative md:inset-x-auto md:bottom-auto md:max-h-[85vh] md:w-full md:max-w-lg md:rounded-xl md:pb-0"
          >
            {/* Handle — 36×4px (mobile uniquement) */}
            <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-pill bg-border md:hidden" />
            <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-4">
              {title ? (
                <h2 className="text-lg font-extrabold tracking-tight text-ink">
                  {title}
                </h2>
              ) : (
                <span />
              )}
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2"
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
