"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MessageSquareText, Scale } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { conflitApi } from "@/lib/api/conflit";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { formatDate } from "@/lib/utils/formatDate";
import type { Conflit } from "@/types/conflit.types";

export default function SyndicConflitsPage() {
  const qc = useQueryClient();
  const [active, setActive] = useState<{ id: string; mode: "note" | "resoudre" } | null>(null);
  const [page, setPage] = useState(1);
  const PAGE = 10;

  const conflits = useQuery({
    queryKey: ["conflits", "pages", page],
    queryFn: () => conflitApi.pages({ page, size: PAGE, sort: "-created_at" }),
  });

  const prendreEnCharge = useMutation({
    mutationFn: (id: string) => conflitApi.prendreEnCharge(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conflits", "pages"] }),
  });

  const list = conflits.data?.items ?? [];
  const total = conflits.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <PageHeader
        title="Conflits"
        subtitle="Médiation des conflits entre habitants"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
          Conflits
        </h1>

        {conflits.isLoading ? (
          <div className="mt-5 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Scale}
            tone="gold"
            title="Aucun conflit"
            subtitle="Les conflits déclarés par les habitants apparaîtront ici."
          />
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {list.map((c) => {
              const statut = c.statut?.code;
              const resolved = statut === "RESOLU";
              const taken = !!c.pris_en_charge_at || statut === "EN_MEDIATION";
              return (
                <div key={c.id} className="rounded-md bg-surface p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-bold text-ink">
                          Villa {c.villa_ciblee_num}
                        </h3>
                        <StatusPill tone={resolved ? "success" : taken ? "warning" : "info"}>
                          {c.statut?.libelle ?? "Signalé"}
                        </StatusPill>
                      </div>
                      {c.categorie && (
                        <div className="mt-0.5 text-[12px] font-semibold text-primary">
                          {c.categorie.libelle}
                        </div>
                      )}
                      <p className="mt-1.5 text-[13px] font-medium text-ink-2">
                        {c.description}
                      </p>
                      {c.user_conflit_declarant_idTouser && (
                        <div className="mt-1 text-[11px] font-medium text-ink-3">
                          Déclaré par {c.user_conflit_declarant_idTouser.prenom}{" "}
                          {c.user_conflit_declarant_idTouser.nom} ·{" "}
                          {formatDate(c.created_at ?? "")}
                        </div>
                      )}
                      {c.note_syndic && (
                        <div className="mt-2 rounded-md bg-surface-2 p-2 text-[12px] font-medium text-ink-2">
                          Note syndic : {c.note_syndic}
                        </div>
                      )}
                      {c.resolution_note && (
                        <div className="mt-2 rounded-md bg-emerald-soft p-2 text-[12px] font-medium text-emerald">
                          Résolution : {c.resolution_note}
                        </div>
                      )}
                    </div>
                  </div>

                  {!resolved && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      {!taken && (
                        <button
                          onClick={() => prendreEnCharge.mutate(c.id)}
                          disabled={prendreEnCharge.isPending}
                          className="rounded-md bg-primary px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50"
                        >
                          Prendre en charge
                        </button>
                      )}
                      <button
                        onClick={() => setActive({ id: c.id, mode: "note" })}
                        className="flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-2 text-[12px] font-bold text-ink-2"
                      >
                        <MessageSquareText size={14} strokeWidth={2} />
                        Note syndic
                      </button>
                      <button
                        onClick={() => setActive({ id: c.id, mode: "resoudre" })}
                        className="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-soft px-3 py-2 text-[12px] font-bold text-emerald"
                      >
                        <CheckCircle2 size={14} strokeWidth={2} />
                        Résoudre
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md bg-surface px-3 py-1.5 text-[13px] font-bold text-ink-3 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-[13px] font-semibold text-ink-2">
              {page} / {pages} · {total} conflit{total > 1 ? "s" : ""}
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

      <ModerationSheet
        conflit={active ? (list.find((c) => c.id === active.id) ?? null) : null}
        mode={active?.mode ?? null}
        onClose={() => setActive(null)}
      />
    </>
  );
}

function ModerationSheet({
  conflit,
  mode,
  onClose,
}: {
  conflit: Conflit | null;
  mode: "note" | "resoudre" | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [classeSansSuite, setClasseSansSuite] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (!conflit) return Promise.resolve(null);
      return mode === "resoudre"
        ? conflitApi.resoudre(conflit.id, text.trim(), classeSansSuite)
        : conflitApi.noteSyndic(conflit.id, text.trim());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conflits", "pages"] });
      setText("");
      setClasseSansSuite(false);
      onClose();
    },
  });

  const isResoudre = mode === "resoudre";

  return (
    <BottomSheet
      open={!!conflit && !!mode}
      onClose={onClose}
      title={isResoudre ? "Résoudre le conflit" : "Note syndic"}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-medium text-ink-3">
          {isResoudre
            ? "Décrivez la résolution du conflit (obligatoire)."
            : "Ajoutez une note interne de suivi."}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isResoudre ? "Ex : Accord trouvé entre les deux villas." : "Note de suivi…"}
          className="h-28 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
        />
        {isResoudre && (
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-2">
            <input
              type="checkbox"
              checked={classeSansSuite}
              onChange={(e) => setClasseSansSuite(e.target.checked)}
              className="h-4 w-4"
            />
            Classer sans suite
          </label>
        )}
        <Button
          fullWidth
          size="lg"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
          disabled={isResoudre ? !text.trim() : !text.trim()}
          className="rounded-md py-4 text-[15px]"
        >
          {isResoudre ? "Confirmer la résolution" : "Enregistrer la note"}
        </Button>
      </div>
    </BottomSheet>
  );
}
