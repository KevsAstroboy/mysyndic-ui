"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HABITANT_NAV, isItemActive, type NavItem } from "./navItems";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLogout } from "@/lib/hooks/useLogout";
import { useUserAvatar } from "@/lib/hooks/useAuthedImage";
import { useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils/cn";

/** Sidebar — icônes (md) → complètes avec labels (lg). Nav par rôle via props. */
export function Sidebar({
  items = HABITANT_NAV,
  home = "/accueil",
}: {
  items?: NavItem[];
  home?: string;
}) {
  const pathname = usePathname();
  const { user, profilActif } = useAuth();
  const logout = useLogout();
  const avatarUrl = useUserAvatar();
  const { dark, toggle: toggleTheme, mounted } = useTheme();

  return (
    <aside className="hidden flex-col border-r border-border bg-surface md:flex md:h-full md:w-[240px] md:shrink-0">
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-6 md:items-stretch md:px-4">
        {/* Logo */}
        <Link
          href={home}
          className="mb-6 flex items-center justify-center gap-3 md:justify-start md:px-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gradient-to-br from-primary to-emerald text-base font-extrabold text-white shadow-[0_4px_12px_rgba(13,110,90,.25)]">
            MS
          </div>
          <div className="hidden min-w-0 md:block">
            <div className="text-base font-extrabold tracking-[-.3px] text-ink">
              MySyndic
            </div>
            <div className="truncate text-[10px] font-semibold text-ink-3">
              {profilActif?.citeNom ?? "Ma cité"}
            </div>
          </div>
        </Link>

        {items.map((item, idx) => {
          const active = isItemActive(pathname, items, item.href);
          const Icon = item.icon;
          const prev = items[idx - 1];
          const showGroup =
            item.group && (!prev || prev.group !== item.group);
          return (
            <div key={item.href} className="w-full">
              {showGroup && (
                <div className="hidden px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[.1em] text-ink-3 md:block">
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center gap-2.5 rounded-sm px-2 py-2.5 text-[13px] font-semibold transition-colors md:justify-start",
                  active
                    ? "bg-primary-light text-accent"
                    : "text-ink-3 hover:text-ink-2",
                )}
              >
                <Icon size={20} strokeWidth={1.7} className="shrink-0" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center justify-center gap-3 md:justify-start">
          <Avatar
            name={`${user?.prenom ?? ""} ${user?.nom ?? ""}`}
            src={avatarUrl}
            size={36}
          />
          <div className="hidden min-w-0 flex-1 md:block">
            <div className="truncate text-[13px] font-bold text-ink">
              {user?.prenom} {user?.nom}
            </div>
            <div className="truncate text-[11px] font-medium text-ink-3">
              {profilActif?.libelle ?? "Habitant"}
              {profilActif?.citeNom ? ` · ${profilActif.citeNom}` : ""}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="hidden hover:text-accent md:block"
          >
            {mounted &&
              (dark ? (
                <Sun size={18} strokeWidth={1.7} />
              ) : (
                <Moon size={18} strokeWidth={1.7} />
              ))}
          </button>
          <button
            onClick={() => {
              logout();
            }}
            aria-label="Se déconnecter"
            className="hidden hover:text-danger md:block"
          >
            <LogOut size={18} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </aside>
  );
}
