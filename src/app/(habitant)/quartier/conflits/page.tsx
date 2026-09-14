"use client";

import { useQuery } from "@tanstack/react-query";
import { Scale, Plus } from "lucide-react";
import { useState } from "react";
import { ConflitCard } from "@/components/features/conflit/ConflitCard";
import { ConflitForm } from "@/components/features/conflit/ConflitForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { conflitApi } from "@/lib/api/conflit";
import { QUERY_KEYS } from "@/lib/api/queryKeys";

export default function ConflitsPage() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE = 6;
  const conflits = useQuery({
    queryKey: QUERY_KEYS.conflits(),
    queryFn: conflitApi.mesConflits,
  });

  const all = conflits.data ?? [];
  const pages = Math.max(1, Math.ceil(all.length / PAGE));
  const safePage = Math.min(page, pages);
  const list = all.slice((safePage - 1) * PAGE, safePage * PAGE);

  return (
    <div className="pt-3 md:pt-5">
      {/* Action desktop */}
      <div className="hidden items-center justify-between pb-4 md:flex">
        <h2 className="text-[15px] font-extrabold tracking-[-.2px] text-ink">
          Conflits déclarés
        </h2>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} strokeWidth={1.8} /> Déclarer un conflit
        </Button>
      </div>

      {/* Action mobile */}
      <div className="px-4 pb-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold text-white shadow-btn"
        >
          <Plus size={18} strokeWidth={1.7} /> Déclarer un conflit
        </button>
      </div>

      {conflits.isLoading ? (
        <div className="space-y-2.5 px-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:px-0">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-md" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Scale}
          tone="red"
          title="Aucun conflit déclaré"
          subtitle="Les conflits de voisinage se règlent ici, avec la médiation du syndic."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} strokeWidth={1.8} /> Déclarer un conflit
            </Button>
          }
        />
      ) : (
        <div className="md:grid md:grid-cols-2 md:gap-4">
          {list.map((c) => (
            <ConflitCard key={c.id} conflit={c} className="md:mx-0 md:mb-0" />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-md bg-surface px-3 py-1.5 text-[13px] font-bold text-ink-3 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-[13px] font-semibold text-ink-2">
            {safePage} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={safePage >= pages}
            className="rounded-md bg-surface px-3 py-1.5 text-[13px] font-bold text-ink-3 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      <ConflitForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
