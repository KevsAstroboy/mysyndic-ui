import { cn } from "@/lib/utils/cn";

/**
 * Skeleton de base — shimmer (surface-2 → highlight), respecte le layout final.
 * Toujours définir une `className` qui reproduit la forme exacte du contenu.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md bg-surface-2", className)} />;
}
