import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  tone?: "teal" | "gold" | "green" | "red" | "neutral";
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const TONE_CLS: Record<string, string> = {
  teal: "bg-primary-light text-primary",
  gold: "bg-gold-soft text-gold",
  green: "bg-emerald-soft text-emerald",
  red: "bg-danger-soft text-danger",
  neutral: "bg-surface-2 text-ink-3",
};

export function EmptyState({
  icon: Icon,
  tone = "neutral",
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center md:py-16">
      {Icon && (
        <div
          className={cn(
            "mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-lg",
            TONE_CLS[tone],
          )}
        >
          <Icon size={32} strokeWidth={1.7} />
        </div>
      )}
      <h3 className="text-[17px] font-extrabold tracking-[-.3px] text-ink">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 max-w-[260px] text-[13px] font-medium leading-relaxed text-ink-3">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
