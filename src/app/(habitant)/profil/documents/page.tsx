"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentUploadSheet } from "@/components/features/document/DocumentUploadSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { documentApi } from "@/lib/api/document";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/formatDate";

export default function DocumentsPage() {
  const router = useRouter();
  const { citeId, hasFeature } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const canUpload = hasFeature("DOCUMENT_UPLOAD");

  const docs = useQuery({
    queryKey: QUERY_KEYS.documents(citeId ?? ""),
    queryFn: () => documentApi.list(citeId!),
    enabled: !!citeId,
  });

  const download = useMutation({
    mutationFn: (id: string) => documentApi.download(id),
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank", "noopener");
    },
  });

  const list = docs.data ?? [];

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Documents partagés par le syndic"
      />

      <div className="mx-auto w-full max-w-6xl md:px-8">
        {/* ── En-tête mobile ── */}
        <div className="flex items-center gap-3 px-5 pb-3 pt-4 md:hidden">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-extrabold tracking-[-.3px] text-ink">
            Documents
          </h1>
          {canUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn"
              aria-label="Déposer un document"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          )}
        </div>

        {canUpload && (
          <div className="hidden px-0 pb-4 pt-6 md:block">
            <button
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-white shadow-btn"
            >
              <Plus size={18} strokeWidth={1.7} /> Déposer un document
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 px-4 pb-6 md:grid md:grid-cols-3 md:gap-4 md:px-0 md:pt-6">
          {docs.isLoading ? (
            [0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))
          ) : list.length === 0 ? (
            <EmptyState
              icon={FileText}
              tone="teal"
              title="Aucun document"
              subtitle="Les documents partagés par le syndic apparaîtront ici."
            />
          ) : (
            list.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-md bg-surface p-3.5 shadow-card"
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
                    {formatDate(d.created_at ?? "")}
                  </div>
                </div>
                <button
                  onClick={() => download.mutate(d.id)}
                  disabled={download.isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink-2"
                  aria-label="Télécharger"
                >
                  <Download size={18} strokeWidth={1.7} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <DocumentUploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
