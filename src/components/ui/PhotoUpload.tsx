"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const MAX_MO = 10;
const MAX_IMAGE_MO = 8; // cohérent avec la limite backend

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/**
 * Les appareils mobiles produisent souvent du HEIC/HEIF (iPhone) ou des
 * photos > 8 Mo : le backend n'accepte que jpg/png/webp ≤ 8 Mo. On reconvertit
 * donc côté client en JPEG (décodage navigateur) quand nécessaire.
 */
export async function toWebSafeJpeg(file: File): Promise<File> {
  const WEB = ["image/jpeg", "image/png", "image/webp"];
  if (WEB.includes(file.type) && file.size <= MAX_IMAGE_MO * 1024 * 1024) {
    return file;
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("Image illisible par le navigateur");
  }
  const MAX_EDGE = 1920;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.86),
  );
  if (!blob) throw new Error("Conversion image impossible");
  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export function PhotoUpload({
  value,
  onChange,
  label = "Ajouter une photo",
  hint = "Optionnel · Max 10 Mo",
  className,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  if (value && !previewRef.current) previewRef.current = URL.createObjectURL(value);
  if (!value) previewRef.current = null;
  const previewUrl = previewRef.current;

  const acceptFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.includes("heic") && !file.type.includes("heif")) {
      setRejected("Formats acceptés : JPEG, PNG, etc.");
      return;
    }
    if (file.size > MAX_MO * 1024 * 1024) {
      setRejected(`Photo trop lourde (max ${MAX_MO} Mo)`);
      return;
    }
    try {
      setRejected(null);
      const safe = await toWebSafeJpeg(file);
      onChange(safe);
    } catch {
      setRejected("Impossible de lire cette image");
    }
  };

  const pick = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target.files?.[0];
    acceptFile(file).catch(() => {});
    if (e) e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label={value ? `Photo sélectionnée : ${value.name}` : label}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          acceptFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed py-5 text-left transition-colors",
          dragging
            ? "border-accent bg-primary-light"
            : value
              ? "border-accent bg-primary-light"
              : "border-border bg-surface-2",
          "hover:border-accent hover:bg-primary-light",
          className,
        )}
      >
        {value && previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/no-img-element */}
            <img
              src={previewUrl}
              alt={value.name}
              className="h-16 w-16 rounded-sm object-cover"
            />
            <span className="max-w-full truncate text-[13px] font-bold text-ink">
              {value.name}
            </span>
            <span className="text-[11px] font-medium text-ink-3">
              {formatSize(value.size)}
            </span>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary-light text-accent">
              <ImagePlus size={18} strokeWidth={1.7} />
            </span>
            <span className="text-[13px] font-bold text-ink">
              Glisser une photo ou
              <span className="text-accent"> parcourir</span>
            </span>
            <span className="text-[11px] font-medium text-ink-3">{hint}</span>
          </>
        )}

        {value && (
          <span
            role="button"
            aria-label="Retirer la photo"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="relative z-10 mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-ink-3"
          >
            <X size={13} strokeWidth={2} /> Retirer
          </span>
        )}
      </div>

      {rejected && (
        <p className="mt-1 text-[11px] font-semibold text-danger">{rejected}</p>
      )}
    </>
  );
}