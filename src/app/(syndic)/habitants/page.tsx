"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Search, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { villaApi } from "@/lib/api/villa";
import { formatDate } from "@/lib/utils/formatDate";

const PAGE_SIZE = 10;

export default function SyndicHabitantsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const candidatures = useQuery({
    queryKey: ["villas", "candidatures"],
    queryFn: villaApi.candidatures,
  });

  const decision = useMutation({
    mutationFn: (d: { id: string; action: "confirmer" | "refuser" }) =>
      d.action === "confirmer"
        ? villaApi.confirmerCandidature(d.id)
        : villaApi.refuserCandidature(d.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["villas", "candidatures"] }),
  });

  const list = candidatures.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const name = `${c.user.prenom} ${c.user.nom}`.toLowerCase();
      const email = (c.user.email ?? "").toLowerCase();
      const tel = (c.user.telephone ?? "").toLowerCase();
      const villa = `villa ${c.villa.numero} ${c.villa.rue ?? ""}`.toLowerCase();
      return name.includes(q) || email.includes(q) || tel.includes(q) || villa.includes(q);
    });
  }, [list, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Habitants"
        subtitle="Validation des candidatures d'occupation de villa"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
          Habitants
        </h1>

        {/* Recherche */}
        <div className="relative mt-4">
          <Search
            size={16}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un nom, email, téléphone ou villa…"
            className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-[11px] pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-primary"
          />
        </div>

        {candidatures.isLoading ? (
          <div className="mt-5 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            tone="teal"
            title={list.length === 0 ? "Aucune candidature" : "Aucun résultat"}
            subtitle={
              list.length === 0
                ? "Les demandes d'occupation de villa en attente apparaîtront ici."
                : "Aucune candidature ne correspond à la recherche."
            }
          />
        ) : (
          <div className="mt-5 overflow-hidden rounded-md bg-surface shadow-card">
            {pageItems.map((c) => {
              const name = `${c.user.prenom} ${c.user.nom}`.trim();
              return (
                <div
                  key={c.user_villa_id}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <Avatar name={name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink">{name}</div>
                    <div className="truncate text-[12px] font-medium text-ink-3">
                      {c.user.email ?? c.user.telephone ?? ""}
                    </div>
                    <div className="text-[11px] font-semibold text-primary">
                      Villa {c.villa.numero}
                      {c.villa.rue ? ` · ${c.villa.rue}` : ""} ·{" "}
                      {formatDate(c.created_at ?? "")}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() =>
                        decision.mutate({ id: c.user_villa_id, action: "confirmer" })
                      }
                      disabled={decision.isPending}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-soft px-3 py-2 text-[12px] font-bold text-emerald disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={2} />
                      Confirmer
                    </button>
                    <button
                      onClick={() =>
                        decision.mutate({ id: c.user_villa_id, action: "refuser" })
                      }
                      disabled={decision.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger disabled:opacity-50"
                      aria-label="Refuser"
                    >
                      <X size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink-3">
            {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-ink-3 shadow-card disabled:opacity-40"
                aria-label="Précédent"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="text-[13px] font-semibold text-ink-2">
                {safePage} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={safePage >= pages}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-ink-3 shadow-card disabled:opacity-40"
                aria-label="Suivant"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
