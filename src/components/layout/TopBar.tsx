"use client";

import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useUserAvatar } from "@/lib/hooks/useAuthedImage";

/** En-tête mobile sticky — salutation + actions + avatar. */
export function TopBar({ onCompose }: { onCompose?: () => void }) {
  const { user } = useAuth();
  const avatarUrl = useUserAvatar();
  const { unreadCount } = useNotifications();

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-bg/95 px-5 pb-3 pt-2 backdrop-blur md:hidden">
      <div>
        <div className="text-xs font-semibold tracking-[.02em] text-primary">
          Bonjour 👋
        </div>
        <div className="mt-px text-[22px] font-extrabold tracking-[-.4px] text-ink">
          {user?.prenom} {user?.nom}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {onCompose && (
          <button
            type="button"
            onClick={onCompose}
            aria-label="Nouvelle publication"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-btn"
          >
            <Plus size={20} strokeWidth={2} />
          </button>
        )}
        <Link
          href="/profil"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-card"
        >
          <Bell size={20} strokeWidth={1.7} className="text-ink" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-[1.5px] border-bg bg-danger" />
          )}
        </Link>
        <Avatar
          name={`${user?.prenom ?? ""} ${user?.nom ?? ""}`}
          src={avatarUrl}
          size={40}
          className="md:hidden"
        />
      </div>
    </div>
  );
}
