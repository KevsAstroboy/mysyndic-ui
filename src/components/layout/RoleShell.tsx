"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ScrollMain } from "./ScrollMain";
import {
  ADMIN_NAV,
  SECURITE_NAV,
  SUPER_ADMIN_NAV,
  SYNDIC_NAV,
  isItemActive,
  type NavItem,
} from "./navItems";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLogout } from "@/lib/hooks/useLogout";
import { useUserAvatar } from "@/lib/hooks/useAuthedImage";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { useComposerStore } from "@/lib/store/composerStore";
import { useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils/cn";

type Role = "SYNDIC" | "ADMIN" | "SUPER_ADMIN" | "SECURITE";

const ROLE_CONFIG: Record<Role, { nav: NavItem[]; home: string; title: string }> = {
  SYNDIC: { nav: SYNDIC_NAV, home: "/dashboard", title: "Syndic" },
  ADMIN: { nav: ADMIN_NAV, home: "/comptes", title: "Administration" },
  SUPER_ADMIN: { nav: SUPER_ADMIN_NAV, home: "/cites", title: "Super Admin" },
  SECURITE: { nav: SECURITE_NAV, home: "/alertes", title: "Sécurité" },
};

/** Coquille des espaces staff (syndic/admin/super-admin/chef sécurité). */
export function RoleShell({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isRole } = useAuth();
  const logout = useLogout();
  const avatarUrl = useUserAvatar();
  const { unreadCount } = useNotifications();
  const base = ROLE_CONFIG[role];

  // Le rôle EFFECTIF vient de la session (profil actif), pas du dossier de la
  // route : un syndic qui visite /comptes (espace admin) garde SON menu complet
  // (SYNDIC_NAV inclut déjà Comptes + Configuration), au lieu du menu admin réduit.
  const estSyndic = isRole("SYNDIC");
  const nav = estSyndic ? SYNDIC_NAV : base.nav;
  const home = estSyndic ? "/dashboard" : base.home;
  const title = estSyndic ? "Syndic" : base.title;
  // Libellé de la rubrique active → affiché dans la topbar mobile (nom de la
  // page en cours), repli sur le libellé du rôle.
  const activeItem = nav.find((item) =>
    isItemActive(pathname, nav, item.href),
  );
  const pageTitle = activeItem?.label ?? title;
  const { dark, toggle: toggleTheme, mounted } = useTheme();
  const openComposer = useComposerStore((s) => s.openFeedComposer);
  const onFeed = pathname === "/feed" || pathname.startsWith("/feed/");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar items={nav} home={home} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <div className="z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-bg/90 px-5 pb-3 pt-4 backdrop-blur md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            >
              <Menu size={18} strokeWidth={1.7} />
            </button>
            <div className="truncate text-[15px] font-extrabold tracking-[-.3px] text-ink">
              {pageTitle}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            {onFeed && (
              <button
                onClick={openComposer}
                aria-label="Nouvelle publication"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn"
              >
                <Plus size={18} strokeWidth={2} />
              </button>
            )}
            <Link
              href="/profil/notifications"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full"
            >
              <Bell size={18} strokeWidth={1.7} className="text-ink" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-[1.5px] border-bg bg-danger" />
              )}
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Basculer le thème"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            >
              {mounted &&
                (dark ? (
                  <Sun size={18} strokeWidth={1.7} />
                ) : (
                  <Moon size={18} strokeWidth={1.7} />
                ))}
            </button>
            <Avatar
              name={`${user?.prenom ?? ""} ${user?.nom ?? ""}`}
              src={avatarUrl}
              size={36}
            />
            <button
              onClick={() => {
                logout();
              }}
              aria-label="Se déconnecter"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink-3 shadow-card"
            >
              <LogOut size={18} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <ScrollMain className="flex-1 overflow-y-auto overflow-x-clip pb-8 md:pb-0">
          {children}
        </ScrollMain>
      </div>

      {/* Drawer mobile */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-border bg-surface p-4 md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between">
                <Link
                  href={home}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-primary to-emerald text-sm font-extrabold text-white">
                    MS
                  </div>
                  <div className="text-base font-extrabold tracking-[-.3px] text-ink">
                    MySyndic
                  </div>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink-3"
                >
                  <X size={18} strokeWidth={1.7} />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                {nav.map((item) => {
                  const active = isItemActive(pathname, nav, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-sm px-3 py-2.5 text-[14px] font-semibold transition-colors",
                        active
                          ? "bg-primary-light text-accent"
                          : "text-ink-3 hover:text-ink-2",
                      )}
                    >
                      <Icon size={20} strokeWidth={1.7} className="shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={`${user?.prenom ?? ""} ${user?.nom ?? ""}`}
                    src={avatarUrl}
                    size={40}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-bold text-ink">
                      {user?.prenom} {user?.nom}
                    </div>
                    <div className="truncate text-[11px] font-medium text-ink-3">
                      {title}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                    }}
                    aria-label="Se déconnecter"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink-3"
                  >
                    <LogOut size={18} strokeWidth={1.7} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
