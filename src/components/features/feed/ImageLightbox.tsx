"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { feedMediaSrc } from "@/lib/utils/feedMedia";
import type { FeedMedia } from "@/types/feed.types";

export function ImageLightbox({
  images,
  startIndex,
  onClose,
}: {
  images: FeedMedia[];
  startIndex: number;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  useEffect(() => setMounted(true), []);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  if (!mounted) return null;
  const current = images[index];

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Galerie photo"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 outline-none backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la galerie"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X size={20} strokeWidth={1.8} />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Photo précédente"
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={24} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Photo suivante"
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight size={24} strokeWidth={1.8} />
            </button>
          </>
        )}

        <motion.img
          key={current?.id ?? index}
          src={current ? feedMediaSrc(current) : undefined}
          alt={current ? `Photo ${index + 1} sur ${count}` : ""}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[88vh] max-w-[92vw] rounded-md object-contain shadow-float"
        />

        {count > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-pill bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {index + 1} / {count}
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
