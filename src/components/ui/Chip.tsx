import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type ChipVariant = "teal" | "green" | "gold" | "red" | "neutral";

const chipVariants: Record<ChipVariant, string> = {
  teal: "bg-primary-light text-primary",
  green: "bg-emerald-soft text-emerald",
  gold: "bg-gold-soft text-gold",
  red: "bg-danger-soft text-danger",
  neutral: "bg-surface-2 text-ink-3 border border-border",
};

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

export function Chip({
  variant = "neutral",
  className,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-pill px-3 py-[5px] text-xs font-bold",
        chipVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
