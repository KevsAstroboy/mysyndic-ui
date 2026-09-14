import { Skeleton } from "@/components/ui/Skeleton";

/** Squelette de carte fidèle à la forme réelle du PostCard. */
export function PostSkeleton() {
  return (
    <div className="rounded-md bg-surface p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <Skeleton className="mt-3 h-56 w-full rounded-md" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  );
}
