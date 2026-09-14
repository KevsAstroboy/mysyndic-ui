"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useCreatePost } from "@/lib/hooks/feed/useCreatePost";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { toast } from "@/lib/utils/toast";
import { cn } from "@/lib/utils/cn";
import { MediaPickerGrid } from "./MediaPickerGrid";
import type { MediaItem } from "@/types/feed.types";

const MAX_CHARS = 5000;

export function CreatePostSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [contenu, setContenu] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending, progress } = useCreatePost();

  useEffect(() => {
    if (!open) return;
    setContenu("");
    setItems([]);
    setError(null);
  }, [open]);

  const cleanClose = () => {
    for (const item of items) URL.revokeObjectURL(item.url);
    onClose();
  };

  const canSubmit =
    !isPending && (contenu.trim().length > 0 || items.length > 0);

  const submit = () => {
    if (!canSubmit) return;
    setError(null);
    mutate(
      {
        contenu: contenu.trim() || undefined,
        files: items.map((i) => i.file),
        meta: items.map((i) => i.meta),
      },
      {
        onSuccess: () => {
          toast({ titre: "Publication partagée", tone: "success" });
          cleanClose();
        },
        onError: (e) =>
          setError(apiErrorMessage(e, "Publication impossible")),
      },
    );
  };

  return (
    <BottomSheet open={open} onClose={cleanClose} title="Nouvelle publication">
      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value.slice(0, MAX_CHARS))}
        placeholder="Partagez quelque chose avec votre cité…"
        rows={4}
        className="mb-1 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3.5 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-3 focus:border-primary focus:bg-surface"
      />
      <div className="mb-3 flex justify-end">
        <span
          className={cn(
            "text-[11px] font-semibold",
            contenu.length > MAX_CHARS - 200 ? "text-gold" : "text-ink-3",
          )}
        >
          {contenu.length}/{MAX_CHARS}
        </span>
      </div>

      <MediaPickerGrid items={items} onChange={setItems} />

      {items.length > 0 && isPending && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-ink-3">
            <span>Envoi en cours…</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-sm bg-danger-soft px-3 py-2 text-xs font-semibold text-danger">
          {error}
        </p>
      )}

      <Button
        fullWidth
        size="lg"
        className="mt-4 rounded-md py-3.5 text-[15px]"
        loading={isPending}
        disabled={!canSubmit}
        onClick={submit}
      >
        {isPending ? "Publication…" : "Publier"}
      </Button>
    </BottomSheet>
  );
}
