"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { incidentApi } from "@/lib/api/incident";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import { countCommentaires } from "@/lib/utils/incident";
import { IncidentPhoto } from "@/components/features/incident/IncidentPhoto";
import type { IncidentCommentaire } from "@/types/incident.types";

function CommentItem({
  comment,
  level,
}: {
  comment: IncidentCommentaire;
  level: number;
}) {
  return (
    <div className={cn("flex gap-3", level > 0 && "ml-10")}>
      <Avatar
        name={`${comment.auteur?.prenom ?? ""} ${comment.auteur?.nom ?? ""}`}
        size={32}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-ink">
            {comment.auteur?.prenom} {comment.auteur?.nom}
          </span>
          <span className="text-[11px] font-medium text-ink-3">
            {formatRelative(comment.created_at ?? "")}
          </span>
        </div>
        <p className="mt-1 text-[13px] font-medium leading-relaxed text-ink-2">
          {comment.texte}
        </p>
        {(comment.reponses ?? []).map((r) => (
          <CommentItem key={r.id} comment={r} level={level + 1} />
        ))}
      </div>
    </div>
  );
}

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const detail = useQuery({
    queryKey: QUERY_KEYS.incident(params.id),
    queryFn: () => incidentApi.get(params.id),
  });

  const like = useMutation({
    mutationFn: () =>
      detail.data?.liked_by_me
        ? incidentApi.unlike(params.id)
        : incidentApi.like(params.id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incident(params.id) }),
  });

  const addComment = useMutation({
    mutationFn: () => incidentApi.commenter(params.id, comment),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incident(params.id) });
    },
  });

  const inc = detail.data;

  return (
    <>
      <div className="md:pt-6">
        <PageHeader
          title="Incident"
          subtitle={inc?.categorie?.libelle ?? inc?.categorie?.code ?? "Détail"}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl md:px-8">
        {/* ── En-tête mobile ── */}
        <div className="flex items-center gap-3 px-5 pb-3 pt-6 md:hidden">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-extrabold tracking-[-.3px] text-ink">
            Incident
          </h1>
        </div>

        {detail.isLoading ? (
          <div className="space-y-3 px-4 md:px-0 md:pt-6">
            <Skeleton className="h-40 rounded-md" />
            <Skeleton className="h-24 rounded-md" />
          </div>
        ) : !inc ? (
          <p className="px-5 text-sm text-ink-3 md:px-0 md:pt-6">
            Incident introuvable.
          </p>
        ) : (
          <>
            <div className="mx-4 rounded-md bg-surface p-4 shadow-card md:mx-0 md:mt-6 md:p-6">
              {inc.categorie && (
                <span className="mb-2 inline-flex rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-bold text-accent">
                  {inc.categorie.libelle ?? inc.categorie.code}
                </span>
              )}
              {inc.statut && (
                <StatusPill
                  tone={
                    inc.statut.code === "RESOLU"
                      ? "success"
                      : inc.statut.code === "EN_COURS"
                        ? "warning"
                        : "info"
                  }
                  className="mb-2 ml-2"
                >
                  {inc.statut.libelle ?? inc.statut.code}
                </StatusPill>
              )}
              <h2 className="mb-1 text-[17px] font-extrabold text-ink">
                {inc.titre ?? inc.description}
              </h2>
              <p className="mb-3 text-[13px] font-medium leading-relaxed text-ink-2">
                {inc.description}
              </p>
              <IncidentPhoto
                path={inc.photo_file_path}
                className="mb-3 max-h-[440px] rounded-md"
              />
              {inc.note_syndic && (
                <div className="mb-3 rounded-md bg-surface-2 p-2.5 text-[12px] font-medium text-ink-2">
                  {inc.note_syndic}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs font-semibold text-ink-3">
                <span className="flex items-center gap-1">
                  {inc.auteur?.prenom} {inc.auteur?.nom}
                </span>
                <span>{formatRelative(inc.created_at ?? "")}</span>
                <button
                  onClick={() => like.mutate()}
                  className="ml-auto flex items-center gap-1.5 text-ink-3"
                >
                  <Heart
                    size={16}
                    strokeWidth={1.7}
                    className={cn(inc.liked_by_me && "fill-danger text-danger")}
                  />
                  {inc.likes_count}
                </button>
              </div>
            </div>

            <div className="px-5 pb-2.5 pt-5 md:px-0">
              <h3 className="text-base font-extrabold tracking-[-.3px] text-ink">
                Commentaires ({inc.commentaires ? countCommentaires(inc.commentaires) : (inc.commentaires_count ?? 0)})
              </h3>
            </div>

            <div className="flex flex-col gap-4 px-5 md:px-0">
              {(inc.commentaires ?? []).map((c) => (
                <CommentItem key={c.id} comment={c} level={0} />
              ))}
              {(inc.commentaires ?? []).length === 0 && (
                <p className="text-[13px] font-medium text-ink-3">
                  Aucun commentaire. Soyez le premier à réagir.
                </p>
              )}
            </div>

            <div className="sticky bottom-0 mt-4 flex items-end gap-2 border-t border-border bg-bg px-4 py-3 md:static md:mb-8 md:mt-5 md:rounded-md md:border md:border-border md:bg-surface md:px-4">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajouter un commentaire…"
                className="flex-1 rounded-pill border-[1.5px] border-border bg-surface px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent md:bg-surface-2"
              />
              <button
                onClick={() => comment.trim() && addComment.mutate()}
                disabled={!comment.trim() || addComment.isPending}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
                aria-label="Envoyer"
              >
                <Send size={18} strokeWidth={1.7} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
