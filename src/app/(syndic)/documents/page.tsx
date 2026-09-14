"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DocumentUploadSheet } from "@/components/features/document/DocumentUploadSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { documentApi } from "@/lib/api/document";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/formatDate";

export default function SyndicDocumentsPage() {
  const { citeId } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const docs = useQuery({
    queryKey: QUERY_KEYS.documents(citeId ?? ""),
    queryFn: () => documentApi.list(citeId!),
    enabled: !!citeId,
  });

  const download = useMutation({
    mutationFn: (id: string) => documentApi.download(id),
    onSuccess: (d) => {
      if (d.url) window.open(d.url, "_blank", "noopener");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => documentApi.remove(id),
    onSuccess: () => {
      setConfirmId(null);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.documents(citeId ?? "") });
    },
  });

  const list = docs.data ?? [];

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Documents partagés avec la cité"
        actions={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-white shadow-btn"
          >
            <Plus size={16} strokeWidth={2} /> Déposer un document
          </button>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
            Documents
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn md:hidden"
            aria-label="Déposer un document"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {docs.isLoading ? (
          <div className="mt-5 flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={FileText}
            tone="teal"
            title="Aucun document"
            subtitle="Déposez un document pour le partager avec les habitants."
          />
        ) : (
          <div className="mt-5 overflow-hidden rounded-md bg-surface shadow-card">
            {list.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-light text-primary">
                  <FileText size={18} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink">
                    {d.titre}
                  </div>
                  <div className="text-[11px] font-medium text-ink-3">
                    {d.type_document?.libelle ?? "Document"} ·{" "}
                    {d.taille_ko ? `${d.taille_ko} Ko · ` : ""}
                    {formatDate(d.created_at ?? "")}
                  </div>
                </div>
                <button
                  onClick={() => download.mutate(d.id)}
                  disabled={download.isPending}
                  aria-label="Télécharger"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-3"
                >
                  <Download size={16} strokeWidth={1.7} />
                </button>
                <button
                  onClick={() => setConfirmId(d.id)}
                  disabled={remove.isPending}
                  aria-label="Supprimer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-3 hover:text-danger"
                >
                  <Trash2 size={16} strokeWidth={1.7} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DocumentUploadSheet open={open} onClose={() => setOpen(false)} />

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        loading={remove.isPending}
        message="Ce document sera supprimé définitivement de la cité."
        onConfirm={() => confirmId && remove.mutate(confirmId)}
      />
    </>
  );
}
