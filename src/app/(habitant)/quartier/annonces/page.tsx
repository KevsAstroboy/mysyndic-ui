"use client";

import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { annonceApi } from "@/lib/api/annonce";
import { formatDate, formatRelative } from "@/lib/utils/formatDate";

export default function AnnoncesPage() {
  const [page, setPage] = useState(1);
  const PAGE = 8;
  const annonces = useQuery({
    queryKey: ["annonces", "pages", page],
    queryFn: () => annonceApi.pages({ page, size: PAGE, sort: "-created_at" }),
  });

  const list = annonces.data?.items ?? [];
  const total = annonces.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="flex flex-col gap-2.5 px-4 pt-3 md:grid md:grid-cols-2 md:gap-4 md:px-0 md:pt-5">
      {annonces.isLoading ? (
        [0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-md" />
        ))
      ) : list.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          tone="teal"
          title="Aucune annonce"
          subtitle="Les annonces du syndic apparaîtront ici."
        />
      ) : (
        <>
          {list.map((a) => (
            <div
              key={a.id}
              className="rounded-md bg-surface p-4 shadow-card md:p-5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
                  {a.categorie?.libelle ?? "Annonce"}
                </span>
                <span className="text-[11px] font-medium text-ink-3">
                  {formatDate(a.created_at ?? "")}
                </span>
              </div>
              <h3 className="mb-1 text-[15px] font-bold text-ink">{a.titre}</h3>
              <p className="mb-2 whitespace-pre-wrap break-words text-[13px] font-medium leading-relaxed text-ink-2">
                {a.contenu}
              </p>
              {a.user && (
                <div className="text-[11px] font-medium text-ink-3">
                  Par {a.user.prenom} {a.user.nom} ·{" "}
                  {formatRelative(a.created_at ?? "")}
                </div>
              )}
            </div>
          ))}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md bg-surface px-3 py-1.5 text-[13px] font-bold text-ink-3 disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-[13px] font-semibold text-ink-2">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="rounded-md bg-surface px-3 py-1.5 text-[13px] font-bold text-ink-3 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
