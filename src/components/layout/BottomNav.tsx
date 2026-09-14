"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HABITANT_NAV, isItemActive } from "./navItems";
import { messageApi } from "@/lib/api/message";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();

  const conversations = useQuery({
    queryKey: QUERY_KEYS.conversations(),
    queryFn: messageApi.conversations,
    refetchInterval: 15000,
  });  const unreadMessages = (conversations.data ?? []).reduce(
    (s, c) => s + c.unread_count,
    0,
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-[82px] items-center justify-around border-t border-black/[.06] px-2 md:hidden"
      style={{
        background: "rgba(255,255,255,.88)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      {HABITANT_NAV.map((item) => {
        const active = isItemActive(pathname, HABITANT_NAV, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex flex-col items-center gap-1 rounded-md px-3 py-2"
          >
            {active && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-md bg-primary-light"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon
              size={22}
              strokeWidth={1.7}
              className={cn("relative", active ? "text-primary" : "text-ink-3")}
            />
            <span
              className={cn(
                "relative text-[10px] font-semibold",
                active ? "text-primary" : "text-ink-3",
              )}
            >
              {item.label}
            </span>
            {item.href === "/messages" && unreadMessages > 0 && (
              <span className="absolute right-2.5 top-1.5 h-2 w-2 rounded-full border-[1.5px] border-bg bg-danger" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
