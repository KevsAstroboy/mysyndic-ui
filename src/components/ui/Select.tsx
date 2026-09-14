import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  return (
    <div className="flex w-full flex-col gap-[6px]">
      {label && (
        <label htmlFor={id} className="text-xs font-bold tracking-[.02em] text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cn(
            "w-full appearance-none rounded-md border-[1.5px] border-border bg-surface-2 px-4 py-[14px] text-[15px] text-ink outline-none transition-colors",
            "focus:border-primary focus:bg-surface",
            error && "border-danger bg-danger-soft",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={1.7}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3"
        />
      </div>
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
    </div>
  );
}
