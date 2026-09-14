"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/quartier", label: "Incidents" },
  { href: "/quartier/annonces", label: "Annonces" },
  { href: "/quartier/conflits", label: "Conflits" },
  { href: "/quartier/alertes", label: "Mes alertes" },
];

export function QuartierTabs() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/quartier"
      ? pathname === "/quartier" || pathname.startsWith("/quartier/incidents")
      : pathname.startsWith(href);

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-1 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-0 md:pb-0 md:pt-6">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-pill border-[1.5px] px-4 py-2 text-[13px] font-bold",
            isActive(t.href)
              ? "border-primary-dark bg-primary-dark text-white"
              : "border-border bg-surface text-ink-3",
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
