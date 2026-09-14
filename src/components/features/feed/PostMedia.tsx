"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";
import { ImageLightbox } from "./ImageLightbox";
import { VideoPlayer } from "./VideoPlayer";
import { cn } from "@/lib/utils/cn";
import { feedMediaSrc } from "@/lib/utils/feedMedia";
import type { FeedMedia } from "@/types/feed.types";

function MediaImage({
  media,
  alt,
  className,
  onOpen,
}: {
  media: FeedMedia;
  alt: string;
  className?: string;
  onOpen: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const src = feedMediaSrc(media);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-surface-2 text-ink-3",
          className,
        )}
      >
        <ImageOff size={22} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Ouvrir la photo"
      className={cn("group/media relative block overflow-hidden", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover/media:scale-[1.02]"
      />
    </button>
  );
}

export function PostMedia({
  media,
  authorName,
}: {
  media: FeedMedia[];
  authorName: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const video = media.find((m) => m.type === "VIDEO");
  if (video) {
    return (
      <div className="overflow-hidden rounded-md">
        <VideoPlayer
          src={feedMediaSrc(video)}
          width={video.largeur}
          height={video.hauteur}
          durationSec={video.duree_sec}
        />
      </div>
    );
  }

  const images = [...media]
    .filter((m) => m.type === "IMAGE")
    .sort((a, b) => a.ordre - b.ordre);
  if (images.length === 0) return null;

  const alt = `Photo de ${authorName}`;
  const single = images[0];
  const singleRatio =
    single.largeur && single.hauteur
      ? `${single.largeur} / ${single.hauteur}`
      : "4 / 3";

  return (
    <>
      <div className="overflow-hidden rounded-md">
        {images.length === 1 ? (
          <div
            style={{ aspectRatio: singleRatio }}
            className="max-h-[70vh] w-full overflow-hidden"
          >
            <MediaImage
              media={single}
              alt={alt}
              onOpen={() => setLightbox(0)}
              className="h-full w-full"
            />
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-0.5">
            {images.map((m, i) => (
              <MediaImage
                key={m.id}
                media={m}
                alt={`${alt} ${i + 1}`}
                onOpen={() => setLightbox(i)}
                className="aspect-square w-full"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0.5">
            <MediaImage
              media={images[0]}
              alt={`${alt} 1`}
              onOpen={() => setLightbox(0)}
              className="col-span-2 aspect-[16/10] w-full"
            />
            {images.slice(1, 3).map((m, i) => (
              <MediaImage
                key={m.id}
                media={m}
                alt={`${alt} ${i + 2}`}
                onOpen={() => setLightbox(i + 1)}
                className="aspect-square w-full"
              />
            ))}
          </div>
        )}
      </div>

      {lightbox !== null && (
        <ImageLightbox
          images={images}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
