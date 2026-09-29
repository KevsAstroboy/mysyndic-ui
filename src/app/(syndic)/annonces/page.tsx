"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AnnonceForm } from "@/components/features/annonce/AnnonceForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { annonceApi } from "@/lib/api/annonce";
import { formatDate } from "@/lib/utils/formatDate";

export default function SyndicAnnoncesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE = 8;

  const annonces = useQuery({
    queryKey: ["annonces", "pages", page],
    queryFn: () => annonceApi.pages({ page, size: PAGE, sort: "-created_at" }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => annonceApi.remove(id),
    onSuccess: () => {
      setConfirmId(null);
      qc.invalidateQueries({ queryKey: ["annonces", "pages"] });
    },
  });

  const list = annonces.data?.items ?? [];
  const total = annonces.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <PageHeader
        title="Annonces"
        subtitle="Publiez et gérez les annonces de la cité"
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-white shadow-btn"
          >
            <Plus size={16} strokeWidth={2} /> Nouvelle annonce
          </button>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
            Annonces
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn md:hidden"
            aria-label="Nouvelle annonce"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {annonces.isLoading ? (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            tone="teal"
            title="Aucune annonce"
            subtitle="Publiez votre première annonce à destination des habitants."
            action={
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-white"
              >
                <Plus size={16} strokeWidth={2} /> Nouvelle annonce
              </button>
            }
          />
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {list.map((a) => (
              <div key={a.id} className="rounded-md bg-surface p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {a.est_epinglee && (
                        <Pin size={14} strokeWidth={2} className="text-gold" />
                      )}
                      <span className="rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-bold text-accent">
                        {a.categorie?.libelle ?? "Annonce"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold text-ink">
                      {a.titre}
                    </h3>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[13px] font-medium leading-relaxed text-ink-2">
                      {a.contenu}
                    </p>
                    <div className="mt-2 text-[11px] font-medium text-ink-3">
                      {formatDate(a.created_at ?? "")}
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmId(a.id)}
                    disabled={remove.isPending}
                    aria-label="Supprimer"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-3 hover:text-danger"
                  >
                    <Trash2 size={16} strokeWidth={1.7} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md bg-surface px-3 py-1.5 text-[13px] font-bold text-ink-3 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-[13px] font-semibold text-ink-2">
              {page} / {pages} · {total} annonce{total > 1 ? "s" : ""}
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
      </div>

      <AnnonceForm open={open} onClose={() => setOpen(false)} />

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        loading={remove.isPending}
        message="Cette annonce sera supprimée définitivement de la cité."
        onConfirm={() => confirmId && remove.mutate(confirmId)}
      />
    </>
  );
}
