import { cn } from "@/lib/utils/cn";

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-emerald text-sm font-extrabold text-white shadow-[0_2px_8px_rgba(13,110,90,.25)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} className="h-full w-full object-cover" />
      ) : (
        initials(name ?? "?")
      )}
    </div>
  );
}
