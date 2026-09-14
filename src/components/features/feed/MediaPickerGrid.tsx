"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  ImagePlus,
  Images,
  Play,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toWebSafeJpeg } from "@/components/ui/PhotoUpload";
import { cn } from "@/lib/utils/cn";
import { readImageMeta, readVideoMeta } from "@/lib/utils/feedMedia";
import type { MediaItem } from "@/types/feed.types";

const MAX_IMAGE_MO = 8;
const VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

function formatDuration(seconds?: number | null): string | null {
  if (!seconds || !Number.isFinite(seconds)) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function MediaPickerGrid({
  items,
  onChange,
  maxPhotos = 3,
  maxVideoMo = 50,
}: {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxPhotos?: number;
  maxVideoMo?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.url);
    };
  }, []);

  const photoCount = items.filter((i) => i.kind === "IMAGE").length;
  const hasVideo = items.some((i) => i.kind === "VIDEO");
  const atLimit = photoCount >= maxPhotos || hasVideo;

  const reject = (message: string) => setError(message);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const current = [...itemsRef.current];
    const added: MediaItem[] = [];

    for (const raw of Array.from(files)) {
      const isImage = raw.type.startsWith("image/");
      const isVideo = raw.type.startsWith("video/");

      if (!isImage && !isVideo) {
        reject("Format non supporté.");
        continue;
      }

      if (isImage) {
        if (hasVideo || added.some((a) => a.kind === "VIDEO")) {
          reject("Impossible de mélanger photos et vidéo.");
          break;
        }
        if (photoCount + added.length >= maxPhotos) {
          reject(`Maximum ${maxPhotos} photos.`);
          break;
        }
        try {
          const safe = await toWebSafeJpeg(raw);
          if (safe.size > MAX_IMAGE_MO * 1024 * 1024) {
            reject(`Photo trop lourde (max ${MAX_IMAGE_MO} Mo).`);
            continue;
          }
          const meta = await readImageMeta(safe);
          added.push({
            file: safe,
            url: URL.createObjectURL(safe),
            kind: "IMAGE",
            meta,
          });
        } catch {
          reject("Impossible de lire cette image.");
        }
      } else {
        if (!VIDEO_MIMES.includes(raw.type)) {
          reject("Formats vidéo acceptés : MP4, WebM, OGG.");
          continue;
        }
        if (current.length + added.length > 0) {
          reject("Une seule vidéo par post, sans photo.");
          break;
        }
        if (raw.size > maxVideoMo * 1024 * 1024) {
          reject(`Vidéo trop lourde (max ${maxVideoMo} Mo).`);
          continue;
        }
        const meta = await readVideoMeta(raw);
        added.push({
          file: raw,
          url: URL.createObjectURL(raw),
          kind: "VIDEO",
          meta,
        });
      }
    }

    if (added.length) onChange([...current, ...added]);
  };

  const remove = (url: string) => {
    URL.revokeObjectURL(url);
    setError(null);
    onChange(items.filter((i) => i.url !== url));
  };

  const move = (index: number, delta: number) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const onlyImages = items.every((i) => i.kind === "IMAGE");

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!atLimit) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!atLimit) void addFiles(e.dataTransfer.files);
      }}
      className={cn(
        "rounded-md border-[1.5px] border-dashed p-2.5 transition-colors",
        dragging
          ? "border-primary bg-primary-light"
          : "border-transparent bg-transparent",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-md border-[1.5px] border-dashed px-4 py-8 transition-colors",
            dragging
              ? "border-primary bg-primary-light"
              : "border-border bg-surface-2 hover:border-primary hover:bg-primary-light",
          )}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
            {dragging ? (
              <Upload size={24} strokeWidth={1.7} />
            ) : (
              <Images size={24} strokeWidth={1.7} />
            )}
          </span>
          <span className="text-center">
            <span className="block text-[14px] font-bold text-ink">
              Ajouter des photos ou une vidéo
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-ink-3">
              Glissez-déposez ou touchez · {maxPhotos} photos max ou 1 vidéo (
              {maxVideoMo} Mo)
            </span>
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const duration = formatDuration(item.meta.duree_sec);
              return (
                <motion.div
                  key={item.url}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="group relative aspect-square overflow-hidden rounded-md bg-surface-2"
                >
                  {item.kind === "VIDEO" ? (
                    <>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
                      <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-pill bg-ink/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Film size={10} strokeWidth={2.2} />
                        Vidéo
                      </span>
                      {duration && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-ink/70 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
                          {duration}
                        </span>
                      )}
                      <span className="pointer-events-none absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-primary shadow-sm">
                        <Play size={12} strokeWidth={2.6} />
                      </span>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={`Aperçu ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}

                  {/* Retirer — visible en permanence sur mobile, au survol sur desktop */}
                  <button
                    type="button"
                    onClick={() => remove(item.url)}
                    aria-label="Retirer ce média"
                    className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-colors hover:bg-danger focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X size={13} strokeWidth={2.4} />
                  </button>

                  {/* Réordonner — images uniquement */}
                  {onlyImages && items.length > 1 && (
                    <div className="absolute inset-x-1 bottom-1 flex justify-between transition-opacity focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label="Déplacer vers la gauche"
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-colors hover:bg-primary disabled:opacity-30"
                      >
                        <ChevronLeft size={13} strokeWidth={2.6} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                        aria-label="Déplacer vers la droite"
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-colors hover:bg-primary disabled:opacity-30"
                      >
                        <ChevronRight size={13} strokeWidth={2.6} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!atLimit && (
            <motion.button
              layout
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Ajouter un média"
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border-[1.5px] border-dashed border-border bg-surface-2 text-ink-3 transition-colors",
                "hover:border-primary hover:bg-primary-light hover:text-primary",
              )}
            >
              <ImagePlus size={20} strokeWidth={1.7} />
              <span className="text-[10px] font-bold">
                {photoCount}/{maxPhotos}
              </span>
            </motion.button>
          )}
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-ink-3">
          {hasVideo
            ? "1 vidéo · sans photo"
            : `${photoCount}/${maxPhotos} photos · ou 1 vidéo`}
        </p>
        {error ? (
          <p className="text-right text-[11px] font-semibold text-danger">
            {error}
          </p>
        ) : (
          items.length > 1 && (
            <p className="text-[11px] font-medium text-ink-3">
              Réorganisez avec les flèches
            </p>
          )
        )}
      </div>
    </div>
  );
}
