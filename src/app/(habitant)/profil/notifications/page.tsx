"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, BellRing, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";

type Filter = "toutes" | "non-lues";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, readAll } = useNotifications();
  const [filter, setFilter] = useState<Filter>("toutes");

  const notifs = useMemo(() => {
    const list = notifications.data ?? [];
    return filter === "non-lues" ? list.filter((n) => !n.lu) : list;
  }, [notifications.data, filter]);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} non-lue${unreadCount > 1 ? "s" : ""}`}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={readAll}
              className="text-[13px] font-semibold text-accent"
            >
              Tout marquer lu
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-3xl md:px-8">
        {/* En-tête mobile */}
        <div className="flex items-center gap-3 px-5 pb-3 pt-6 md:hidden">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-extrabold tracking-[-.3px] text-ink">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={readAll}
              className="ml-auto text-[13px] font-semibold text-accent"
            >
              Tout marquer lu
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto px-5 md:mt-5 md:px-0">
          {(
            [
              { key: "toutes", label: `Toutes · ${(notifications.data ?? []).length}` },
              { key: "non-lues", label: `Non lues · ${unreadCount}` },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-pill px-3 py-1.5 text-[12px] font-bold transition-colors",
                filter === f.key
                  ? "bg-primary text-white shadow-btn"
                  : "bg-surface-2 text-ink-3",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {notifications.isLoading ? (
          <div className="mt-4 flex flex-col gap-2 px-4 md:px-0">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-md bg-surface-2"
              />
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 px-5 text-center md:px-0">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3">
              <BellRing size={22} strokeWidth={1.6} />
            </span>
            <p className="text-sm font-bold text-ink">
              {filter === "non-lues"
                ? "Aucune notification non lue."
                : "Aucune notification pour le moment."}
            </p>
            <p className="text-[12px] font-medium text-ink-3">
              Les alertes de la cité et les messages arriveront ici.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2 px-4 pb-10 md:px-0">
            {notifs.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.lu) markRead(n.id);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-md bg-surface p-3.5 text-left shadow-card",
                  !n.lu && "border-l-4 border-accent",
                )}
              >
                {!n.lu ? (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
                ) : (
                  <span className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <Check size={8} strokeWidth={2} className="text-ink-3" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-ink">{n.titre}</div>
                  {n.message && (
                    <div className="mt-0.5 text-xs font-medium text-ink-2">
                      {n.message}
                    </div>
                  )}
                  <div className="mt-1 text-[11px] font-medium text-ink-3">
                    {formatRelative(n.created_at ?? "")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}