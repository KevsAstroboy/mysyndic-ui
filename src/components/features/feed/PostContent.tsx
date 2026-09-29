"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

/** Texte du post : sauts de ligne préservés + repli « Voir plus ». */
export function PostContent({ texte }: { texte?: string | null }) {
  const [open, setOpen] = useState(false);
  const value = texte?.trim();
  if (!value) return null;

  const long = value.length > 280 || value.split("\n").length > 4;

  return (
    <div className="px-4 pb-2.5 pt-0.5">
      <p
        className={cn(
          "whitespace-pre-wrap break-words text-[14px] leading-relaxed text-ink",
          !open && long && "line-clamp-4",
        )}
      >
        {value}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-0.5 text-[13px] font-bold text-accent"
        >
          {open ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
