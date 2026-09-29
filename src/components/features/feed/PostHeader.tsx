"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelative } from "@/lib/utils/formatDate";
import { feedMediaSrc } from "@/lib/utils/feedMedia";
import type { FeedPost } from "@/types/feed.types";

export function PostHeader({
  post,
  canDelete,
  onDelete,
}: {
  post: FeedPost;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const author = post.auteur;
  const name = `${author?.prenom ?? ""} ${author?.nom ?? ""}`.trim() || "Habitant";
  const villaLabel = author?.villa
    ? `Villa ${author.villa.numero}${author.villa.rue ? `, ${author.villa.rue}` : ""}`
    : null;

  return (
    <div className="flex items-center gap-3 px-4 pb-2.5 pt-4">
      <Avatar
        name={name}
        src={feedMediaSrc({
          file_path: author?.photo_file_path,
          url: author?.photo_url,
        })}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold text-ink">{name}</div>
        <div className="truncate text-[11px] font-medium text-ink-3">
          {villaLabel && <span className="text-ink-2">{villaLabel} · </span>}
          {formatRelative(post.created_at ?? "")}
        </div>
      </div>

      {canDelete && (
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Actions du post"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-2"
          >
            <MoreHorizontal size={18} strokeWidth={1.8} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-float"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
              >
                <Trash2 size={15} strokeWidth={1.8} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
