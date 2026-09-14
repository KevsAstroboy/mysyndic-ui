"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageCircle,
  MessageSquareText,
  Search,
  Send,
  ThumbsUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { incidentApi } from "@/lib/api/incident";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/formatDate";
import type { Incident, IncidentCommentaire } from "@/types/incident.types";

const PAGE_SIZE = 10;

const STATUT_TONE: Record<string, "info" | "warning" | "success"> = {
  SIGNALE: "info",
  EN_COURS: "warning",
  RESOLU: "success",
};

function isResolu(inc: Incident) {
  return inc.statut?.code === "RESOLU";
}
function isEnCours(inc: Incident) {
  return inc.statut?.code === "EN_COURS";
}

export default function SyndicIncidentsPage() {
  const { citeId } = useAuth();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyFocus, setReplyFocus] = useState(false);
  const [moderate, setModerate] = useState<{ id: string; mode: "note" | "resoudre" } | null>(null);

  const incidents = useQuery({
    queryKey: QUERY_KEYS.incidents(citeId ?? ""),
    queryFn: () => incidentApi.list(citeId!),
    enabled: !!citeId,
  });

  const categories = useQuery({
    queryKey: ["incidents", "categories"],
    queryFn: incidentApi.categories,
  });

  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.incidents(citeId ?? "") });
    qc.invalidateQueries({ queryKey: ["incidents", "detail", selectedId] });
  };

  const prendreEnCharge = useMutation({
    mutationFn: (id: string) => incidentApi.prendreEnCharge(id),
    onSuccess: invalidate,
  });

  const list = incidents.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((inc) => {
      if (categorieId && String(inc.categorie?.id ?? "") !== categorieId) return false;
      if (!q) return true;
      const hay = `${inc.titre ?? ""} ${inc.description ?? ""} ${
        inc.auteur?.prenom ?? ""
      } ${inc.auteur?.nom ?? ""} villa ${inc.villa?.numero ?? ""} ${
        inc.villa?.rue ?? ""
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [list, query, categorieId]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="Signalements des habitants de la cité"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
          Incidents
        </h1>

        {/* Filtres */}
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-xs">
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
              placeholder="Rechercher un incident, auteur, villa…"
              className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-[11px] pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-primary"
            />
          </div>
          <select
            value={categorieId}
            onChange={(e) => {
              setCategorieId(e.target.value);
              setPage(1);
            }}
            className="rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-[11px] text-sm font-semibold text-ink outline-none focus:border-primary"
          >
            <option value="">Toutes les catégories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.libelle}
              </option>
            ))}
          </select>
        </div>

        {incidents.isLoading ? (
          <div className="mt-5 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 rounded-md" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Info}
            tone="teal"
            title={list.length === 0 ? "Aucun incident" : "Aucun résultat"}
            subtitle={
              list.length === 0
                ? "Les signalements des habitants apparaîtront ici."
                : "Aucun incident ne correspond aux filtres."
            }
          />
        ) : (
          <>
            <div className="mt-5 flex flex-col gap-3">
              {pageItems.map((inc) => (
                <div key={inc.id} className="rounded-md bg-surface p-4 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
                        {inc.categorie?.libelle ?? "Incident"}
                      </span>
                      {inc.statut && (
                        <StatusPill tone={STATUT_TONE[inc.statut.code] ?? "info"}>
                          {inc.statut.libelle ?? inc.statut.code}
                        </StatusPill>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-ink-3">
                      {formatDate(inc.created_at ?? "")}
                    </span>
                  </div>
                  {inc.titre && (
                    <h3 className="mt-2 text-[15px] font-bold text-ink">
                      {inc.titre}
                    </h3>
                  )}
                  <p className="mt-1 text-[13px] font-medium text-ink-2">
                    {inc.description}
                  </p>
                  {inc.note_syndic && (
                    <div className="mt-2 rounded-md bg-surface-2 p-2 text-[12px] font-medium text-ink-2">
                      Note syndic : {inc.note_syndic}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-ink-3">
                    {inc.auteur && (
                      <span>
                        Par {inc.auteur.prenom} {inc.auteur.nom}
                      </span>
                    )}
                    {inc.villa && (
                      <span className="text-ink-2">
                        Villa {inc.villa.numero}
                        {inc.villa.rue ? ` · ${inc.villa.rue}` : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={13} strokeWidth={1.7} />
                      {inc.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={13} strokeWidth={1.7} />
                      {inc.commentaires_count ?? 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <button
                      onClick={() => {
                        setSelectedId(inc.id);
                        setReplyFocus(true);
                      }}
                      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-bold text-white"
                    >
                      <Send size={14} strokeWidth={2} /> Répondre
                    </button>
                    <button
                      onClick={() => {
                        setSelectedId(inc.id);
                        setReplyFocus(false);
                      }}
                      className="rounded-md bg-surface-2 px-3 py-2 text-[12px] font-bold text-ink-2"
                    >
                      Voir le fil
                    </button>
                    {!isResolu(inc) && !isEnCours(inc) && (
                      <button
                        onClick={() => prendreEnCharge.mutate(inc.id)}
                        disabled={prendreEnCharge.isPending}
                        className="rounded-md bg-primary px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50"
                      >
                        Prendre en charge
                      </button>
                    )}
                    {!isResolu(inc) && (
                      <button
                        onClick={() => setModerate({ id: inc.id, mode: "note" })}
                        className="flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-2 text-[12px] font-bold text-ink-2"
                      >
                        <MessageSquareText size={14} strokeWidth={2} /> Note
                      </button>
                    )}
                    {!isResolu(inc) && (
                      <button
                        onClick={() => setModerate({ id: inc.id, mode: "resoudre" })}
                        className="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-soft px-3 py-2 text-[12px] font-bold text-emerald"
                      >
                        <CheckCircle2 size={14} strokeWidth={2} /> Résoudre
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-3">
                {filtered.length} incident{filtered.length > 1 ? "s" : ""}
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
          </>
        )}
      </div>

      <IncidentDetailSheet
        incidentId={selectedId}
        replyFocus={replyFocus}
        onClose={() => setSelectedId(null)}
      />

      <ModerationSheet
        incident={moderate ? (list.find((i) => i.id === moderate.id) ?? null) : null}
        mode={moderate?.mode ?? null}
        onClose={() => setModerate(null)}
      />
    </>
  );
}

function ModerationSheet({
  incident,
  mode,
  onClose,
}: {
  incident: Incident | null;
  mode: "note" | "resoudre" | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { citeId } = useAuth();
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      if (!incident) return Promise.resolve(null);
      return mode === "resoudre"
        ? incidentApi.resoudre(incident.id, text.trim())
        : incidentApi.noteSyndic(incident.id, text.trim());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incidents(citeId ?? "") });
      qc.invalidateQueries({ queryKey: ["incidents", "detail", incident?.id] });
      setText("");
      onClose();
    },
  });

  const isResoudre = mode === "resoudre";

  return (
    <BottomSheet
      open={!!incident && !!mode}
      onClose={onClose}
      title={isResoudre ? "Résoudre l'incident" : "Note syndic"}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-medium text-ink-3">
          {isResoudre
            ? "Décrivez la résolution de l'incident (obligatoire)."
            : "Ajoutez une note interne de suivi."}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isResoudre ? "Ex : Panne réparée, éclairage rétabli." : "Note de suivi…"}
          className="h-28 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
        />
        <Button
          fullWidth
          size="lg"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
          disabled={!text.trim()}
          className="rounded-md py-4 text-[15px]"
        >
          {isResoudre ? "Confirmer la résolution" : "Enregistrer la note"}
        </Button>
      </div>
    </BottomSheet>
  );
}

function IncidentDetailSheet({
  incidentId,
  replyFocus,
  onClose,
}: {
  incidentId: string | null;
  replyFocus: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { citeId } = useAuth();
  const [texte, setTexte] = useState("");

  const detail = useQuery({
    queryKey: ["incidents", "detail", incidentId],
    queryFn: () => incidentApi.get(incidentId!),
    enabled: !!incidentId,
  });

  const commenter = useMutation({
    mutationFn: () => incidentApi.commenter(incidentId!, texte),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents", "detail", incidentId] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incidents(citeId ?? "") });
      setTexte("");
    },
  });

  const d = detail.data;

  return (
    <BottomSheet open={!!incidentId} onClose={onClose} title="Incident">
      {!d ? (
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-16 rounded-md" />
          <Skeleton className="h-16 rounded-md" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
                {d.categorie?.libelle ?? "Incident"}
              </span>
              {d.villa && (
                <span className="text-[12px] font-semibold text-ink-2">
                  Villa {d.villa.numero}
                  {d.villa.rue ? ` · ${d.villa.rue}` : ""}
                </span>
              )}
            </div>
            {d.titre && (
              <h3 className="mt-2 text-[16px] font-extrabold text-ink">{d.titre}</h3>
            )}
            <p className="mt-1 text-[14px] font-medium text-ink-2">{d.description}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold text-ink-3">
              {d.auteur && (
                <span>
                  Par {d.auteur.prenom} {d.auteur.nom}
                </span>
              )}
              <span>{formatDate(d.created_at ?? "")}</span>
            </div>
          </div>

          {/* Commentaires */}
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <div className="text-[12px] font-bold uppercase tracking-[.06em] text-ink-3">
              Commentaires ({d.commentaires?.length ?? 0})
            </div>
            {(d.commentaires ?? []).length === 0 ? (
              <p className="text-[13px] font-medium text-ink-3">
                Aucun commentaire pour le moment.
              </p>
            ) : (
              (d.commentaires ?? []).map((c) => (
                <CommentItem key={c.id} comment={c} />
              ))
            )}
          </div>

          {/* Réponse */}
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <textarea
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder="Écrire une réponse…"
              rows={3}
              className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[14px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
            />
            <button
              onClick={() => commenter.mutate()}
              disabled={!texte.trim() || commenter.isPending}
              className="self-end flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
            >
              <Send size={14} strokeWidth={2} /> Envoyer
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function CommentItem({ comment }: { comment: IncidentCommentaire }) {
  return (
    <div className="rounded-md bg-surface-2 p-3">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-bold text-ink">
          {comment.auteur?.prenom} {comment.auteur?.nom}
        </span>
        <span className="text-[10px] font-medium text-ink-3">
          {comment.created_at ? formatDate(comment.created_at) : ""}
        </span>
      </div>
      <p className="mt-1 text-[13px] font-medium text-ink-2">{comment.texte}</p>
      {comment.reponses?.map((r) => (
        <div key={r.id} className="mt-2 border-l-2 border-border pl-3">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-ink">
              {r.auteur?.prenom} {r.auteur?.nom}
            </span>
            <span className="text-[10px] font-medium text-ink-3">
              {r.created_at ? formatDate(r.created_at) : ""}
            </span>
          </div>
          <p className="mt-0.5 text-[13px] font-medium text-ink-2">{r.texte}</p>
        </div>
      ))}
    </div>
  );
}
