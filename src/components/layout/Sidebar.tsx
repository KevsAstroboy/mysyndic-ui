"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HABITANT_NAV, isItemActive, type NavItem } from "./navItems";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useUserAvatar } from "@/lib/hooks/useAuthedImage";
import { useThemeStore } from "@/lib/store/themeStore";
import { cn } from "@/lib/utils/cn";

/** Sidebar — icônes (md) → complète avec labels (lg). Nav par rôle via props. */
export function Sidebar({
  items = HABITANT_NAV,
  home = "/accueil",
  dark = false,
}: {
  items?: NavItem[];
  home?: string;
  dark?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profilActif, logout } = useAuth();
  const avatarUrl = useUserAvatar();
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <aside
      className={cn(
        "hidden flex-col border-r md:sticky md:top-0 md:flex md:h-dvh md:w-[240px]",
        dark
          ? "border-white/8 bg-[#0F1E2D]"
          : "border-border bg-surface",
      )}
    >
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
            <div
              className={cn(
                "text-base font-extrabold tracking-[-.3px]",
                dark ? "text-white" : "text-ink",
              )}
            >
              MySyndic
            </div>
            <div
              className={cn(
                "truncate text-[10px] font-semibold",
                dark ? "text-white/40" : "text-ink-3",
              )}
            >
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
                <div
                  className={cn(
                    "hidden px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[.1em] md:block",
                    dark ? "text-white/30" : "text-ink-3",
                  )}
                >
                  {item.group}
                </div>
              )}
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center gap-2.5 rounded-sm px-2 py-2.5 text-[13px] font-semibold transition-colors md:justify-start",
                  active
                    ? dark
                      ? "bg-white/10 text-white"
                      : "bg-primary-light text-primary"
                    : dark
                      ? "text-white/45 hover:text-white"
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
      <div
        className={cn(
          "mt-auto border-t p-4",
          dark ? "border-white/8" : "border-border",
        )}
      >
        <div className="flex items-center justify-center gap-3 md:justify-start">
          <Avatar
            name={`${user?.prenom ?? ""} ${user?.nom ?? ""}`}
            src={avatarUrl}
            size={36}
          />
          <div className="hidden min-w-0 flex-1 md:block">
            <div
              className={cn(
                "truncate text-[13px] font-bold",
                dark ? "text-white" : "text-ink",
              )}
            >
              {user?.prenom} {user?.nom}
            </div>
            <div
              className={cn(
                "truncate text-[11px] font-medium",
                dark ? "text-white/40" : "text-ink-3",
              )}
            >
              {profilActif?.libelle ?? "Habitant"}
              {profilActif?.citeNom ? ` · ${profilActif.citeNom}` : ""}
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className={cn(
              "hidden hover:text-primary md:block",
              dark ? "text-white/45" : "text-ink-3",
            )}
          >
            {dark ? <Sun size={18} strokeWidth={1.7} /> : <Moon size={18} strokeWidth={1.7} />}
          </button>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            aria-label="Se déconnecter"
            className={cn(
              "hidden hover:text-danger md:block",
              dark ? "text-white/45" : "text-ink-3",
            )}
          >
            <LogOut size={18} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </aside>
  );
}
