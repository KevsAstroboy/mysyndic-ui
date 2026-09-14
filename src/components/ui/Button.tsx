"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-btn",
  secondary: "bg-surface-2 text-ink-2 border border-border",
  danger: "bg-danger text-white shadow-[0_2px_8px_var(--red-glow)]",
  ghost: "bg-transparent text-ink-2",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-[9px] text-[13px]",
  lg: "px-5 py-3 text-sm",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.08 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-[7px] rounded-sm font-bold",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        (disabled || loading) && "pointer-events-none opacity-60",
        className,
      )}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </motion.button>
  );
}
