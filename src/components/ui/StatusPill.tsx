import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type StatusPillTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<StatusPillTone, string> = {
  success: "bg-emerald-soft text-emerald",
  warning: "bg-gold-soft text-gold",
  danger: "bg-danger-soft text-danger",
  info: "bg-primary-light text-primary",
  neutral: "bg-surface-2 text-ink-3",
};

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusPillTone;
}

export function StatusPill({
  tone = "neutral",
  className,
  ...props
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-pill px-3 py-[5px] text-[11px] font-bold tracking-[.02em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
