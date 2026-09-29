"use client";

import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils/cn";

/** Une seule vidéo peut jouer à la fois sur la page. */
let activeVideo: HTMLVideoElement | null = null;

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  poster,
  width,
  height,
  durationSec,
  className,
}: {
  src?: string | null;
  poster?: string | null;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSec ?? 0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [naturalRatio, setNaturalRatio] = useState<string | null>(null);

  const ratio =
    width && height ? `${width} / ${height}` : naturalRatio ?? "16 / 9";

  const play = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (activeVideo && activeVideo !== video) activeVideo.pause();
    try {
      await video.play();
      activeVideo = video;
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else void play();
  }, [playing, play, pause]);

  // Autoplay muet uniquement quand la vidéo est visible (et motion autorisée).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reducedMotion) {
          void play();
        } else if (!entry.isIntersecting && activeVideo === video) {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [play, reducedMotion]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-surface-2 text-xs font-semibold text-ink-3",
          className,
        )}
        style={{ aspectRatio: ratio }}
      >
        Vidéo indisponible
      </div>
    );
  }

  return (
    <div
      className={cn("group relative overflow-hidden bg-black", className)}
      style={{ aspectRatio: ratio }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        muted={muted}
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setLoading(false);
          if (Number.isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
          // Dimensions inconnues en base (meta d'upload absente) : on adopte le
          // ratio réel de la vidéo pour éviter un cadrage 16/9 erroné.
          if (!width || !height) {
            const vw = e.currentTarget.videoWidth;
            const vh = e.currentTarget.videoHeight;
            if (vw && vh) setNaturalRatio(`${vw} / ${vh}`);
          }
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        onClick={toggle}
      />

      {loading && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-overlay/70 px-4 text-center text-xs font-semibold text-white">
          Impossible de lire cette vidéo
        </div>
      )}

      {!failed && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 pt-8">
          <input
            type="range"
            min={0}
            max={Math.max(duration, 0.01)}
            step={0.1}
            value={current}
            aria-label="Progression de la vidéo"
            onChange={(e) => {
              const value = Number(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = value;
              setCurrent(value);
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-pill bg-white/30 accent-white"
          />
          <div className="mt-1.5 flex items-center gap-2.5 text-white">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              {playing ? (
                <Pause size={16} strokeWidth={2} />
              ) : (
                <Play size={16} strokeWidth={2} />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                if (videoRef.current) videoRef.current.muted = next;
              }}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              {muted ? (
                <VolumeX size={16} strokeWidth={2} />
              ) : (
                <Volume2 size={16} strokeWidth={2} />
              )}
            </button>
            <span className="text-[11px] font-bold tabular-nums">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                if (document.fullscreenElement) void document.exitFullscreen();
                else void video.requestFullscreen?.();
              }}
              aria-label="Plein écran"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
            >
              <Maximize size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
