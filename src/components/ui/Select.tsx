"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "./BottomSheet";
import { useIsDesktop } from "@/lib/hooks/useIsDesktop";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Force la recherche. Afin par défaut dès 3 options. */
  searchable?: boolean;
  /** `sm` pour les barres de filtres, `md` (défaut) pour les formulaires. */
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

const DROP_MAX_H = 264;
const SEARCH_THRESHOLD = 3;

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const TRIGGER_SIZE = {
  md: "px-4 py-[14px] text-[15px]",
  sm: "px-3 py-2 text-sm",
} as const;

const CHEVRON_SIZE = { md: 18, sm: 16 } as const;

/**
 * Select partagé, adapté au viewport :
 * - mobile / tablette : feuille bas d'écran (BottomSheet), grandes cibles tactiles ;
 * - desktop : popover ancré sous le champ.
 * Recherche automatique si la liste dépasse 7 options.
 */
export function Select({
  options,
  value,
  onChange,
  label,
  error,
  hint,
  placeholder = "Sélectionner…",
  disabled = false,
  searchable,
  size = "md",
  className,
  id,
}: SelectProps) {
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState<{
    left: number;
    top: number;
    width: number;
    openUp: boolean;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const showSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return options;
    return options.filter((o) => normalize(o.label).includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, isDesktop]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function toggle() {
    if (disabled) return;
    if (open) {
      close();
      return;
    }
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < DROP_MAX_H && r.top > DROP_MAX_H;
      setAnchor({
        left: r.left,
        top: openUp ? r.top - DROP_MAX_H : r.bottom + 6,
        width: r.width,
        openUp,
      });
    }
    setQuery("");
    setOpen(true);
  }

  function pick(v: string) {
    onChange(v);
    close();
  }

  function isSelected(o: SelectOption) {
    return o.value === value;
  }

  return (
    <div className={cn("flex w-full flex-col gap-[6px]", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold tracking-[.02em] text-ink-2"
        >
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        id={id}
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border-[1.5px] border-border bg-surface-2 text-left font-semibold outline-none transition-colors focus:border-accent focus:bg-surface",
          TRIGGER_SIZE[size],
          disabled && "cursor-not-allowed opacity-60",
          error && "border-danger bg-danger-soft",
        )}
      >
        <span
          className={cn(
            "truncate",
            selected ? "text-ink" : "font-medium text-ink-3",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={CHEVRON_SIZE[size]}
          strokeWidth={1.7}
          className={cn(
            "shrink-0 text-ink-3 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Desktop — popover ancré */}
      {open &&
        isDesktop &&
        anchor &&
        createPortal(
          <div
            ref={popRef}
            className="fixed z-[60] overflow-hidden rounded-md border border-border bg-surface shadow-float"
            style={{
              left: anchor.left,
              top: anchor.top,
              width: anchor.width,
              maxHeight: DROP_MAX_H,
            }}
          >
            {showSearch && (
              <div className="flex items-center gap-2 border-b border-border px-3.5 py-2.5">
                <Search size={15} strokeWidth={1.7} className="text-ink-3" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-3"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3.5 py-4 text-[13px] font-medium text-ink-3">
                  Aucun résultat
                </p>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={o.disabled}
                    onClick={() => pick(o.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-sm px-3.5 py-3 text-left text-sm font-semibold transition-colors",
                      o.disabled
                        ? "cursor-not-allowed text-ink-3/60"
                        : "text-ink hover:bg-primary-light hover:text-accent",
                      isSelected(o) && !o.disabled && "bg-primary-light text-accent",
                    )}
                  >
                    <span className="truncate">{o.label}</span>
                    {isSelected(o) && (
                      <Check size={16} strokeWidth={2.4} className="shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Mobile / tablette — feuille */}
      <BottomSheet
        open={open && !isDesktop}
        onClose={close}
        title={label}
      >
        {showSearch && (
          <div className="mb-3 flex items-center gap-2 rounded-md border-[1.5px] border-border bg-surface-2 px-3.5 py-3">
            <Search size={16} strokeWidth={1.7} className="text-ink-3" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="w-full bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-3"
            />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {filtered.length === 0 ? (
            <p className="px-1 py-4 text-[15px] font-medium text-ink-3">
              Aucun résultat
            </p>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                disabled={o.disabled}
                onClick={() => pick(o.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-sm px-3.5 py-3.5 text-left text-[15px] font-semibold transition-colors",
                  o.disabled
                    ? "cursor-not-allowed text-ink-3/60"
                    : "text-ink active:bg-primary-light",
                  isSelected(o) && !o.disabled && "bg-primary-light text-accent",
                )}
              >
                <span className="truncate">{o.label}</span>
                {isSelected(o) && (
                  <Check size={18} strokeWidth={2.4} className="shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </BottomSheet>

      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      {!error && hint && <p className="text-xs font-medium text-ink-3">{hint}</p>}
    </div>
  );
}
