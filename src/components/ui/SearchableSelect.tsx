"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

export interface SearchableOption {
  value: string;
  label: string;
}

const DROP_MAX_H = 224; // max-h-56

/** Select avec recherche (combobox simple, liste filtrable, portal fixed). */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
  className,
  emptyLabel = "Aucun résultat",
  id,
}: {
  options: SearchableOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  emptyLabel?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState<{
    left: number;
    top: number;
    width: number;
    openUp: boolean;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (ref.current && !ref.current.contains(t)) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((o) => o.value === value);

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < DROP_MAX_H && r.top > DROP_MAX_H;
    setAnchor({
      left: r.left,
      top: openUp ? r.top - DROP_MAX_H : r.bottom + 2,
      width: Math.max(r.width, 200),
      openUp,
    });
    setQuery("");
    setOpen(true);
  }

  const listHeight = Math.min(filtered.length * 40 + 40, DROP_MAX_H);
  const top = anchor
    ? anchor.openUp
      ? anchor.top + (DROP_MAX_H - listHeight)
      : anchor.top
    : 0;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        onClick={toggle}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-[11px] text-left text-sm font-semibold outline-none focus:border-primary",
          selected ? "text-ink" : "text-ink-3",
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} strokeWidth={2} className="shrink-0 text-ink-3" />
      </button>

      {open &&
        anchor &&
        createPortal(
          <div
            className="fixed z-[60] overflow-hidden rounded-md border border-border bg-surface shadow-float"
            style={{
              left: anchor.left,
              top,
              width: anchor.width,
              maxHeight: DROP_MAX_H,
            }}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={14} strokeWidth={1.7} className="text-ink-3" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-[13px] font-medium text-ink-3">
                  {emptyLabel}
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "block w-full px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-primary-light hover:text-primary",
                      o.value === value ? "bg-primary-light text-primary" : "text-ink",
                    )}
                  >
                    {o.label}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}