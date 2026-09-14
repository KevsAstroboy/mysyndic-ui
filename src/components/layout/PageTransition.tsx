"use client";

import { motion, type Variants } from "framer-motion";

export type PageTransitionVariant = "tab" | "push" | "fade";

const variants: Record<PageTransitionVariant, Variants> = {
  // Navigation principale (onglets bottom nav) — slide horizontal
  tab: {
    initial: { opacity: 0, x: 24 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
    },
    exit: {
      opacity: 0,
      x: -24,
      transition: { duration: 0.16, ease: [0.32, 0.72, 0, 1] },
    },
  },
  // Drill-down (liste → détail) — slide up léger
  push: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
    },
    exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
  },
  // Pages desktop (sidebar fixe) — fade pur
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  },
};

export function PageTransition({
  variant = "fade",
  className,
  children,
}: {
  variant?: PageTransitionVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={variants[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { variants as pageTransitionVariants };
