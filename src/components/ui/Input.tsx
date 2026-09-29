import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  /** Icône décorative à gauche du champ. */
  leadingIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  leadingIcon,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex w-full flex-col gap-[6px]">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold tracking-[.02em] text-ink-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "w-full rounded-md border-[1.5px] border-border bg-surface-2 px-4 py-[14px] text-[15px] text-ink outline-none transition-colors placeholder:text-ink-3",
            "focus:border-accent focus:bg-surface",
            leadingIcon ? "pl-11" : undefined,
            icon ? "pr-11" : undefined,
            error && "border-danger bg-danger-soft",
            className,
          )}
          {...props}
        />
        {icon && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3">
            {icon}
          </span>
        )}
      </div>
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      {!error && hint && <p className="text-xs font-medium text-ink-3">{hint}</p>}
    </div>
  );
}
