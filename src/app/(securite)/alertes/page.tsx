"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { StatusPill } from "@/components/ui/StatusPill";
import { alerteApi } from "@/lib/api/alerte";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import { renderMessageContent } from "@/lib/utils/messageContent";
import type { Alerte } from "@/types/alerte.types";

export default function AlertesPage() {
  // Le syndic consulte (lecture) ; seul le chef sécurité peut modifier.
  const { isRole } = useAuth();
  const canManage = isRole("CHEF_SECURITE");
  const [tab, setTab] = useState<"actives" | "historique">("actives");
  const [escaladeTarget, setEscaladeTarget] = useState<Alerte | null>(null);
  // Traitement d'une alerte (avancer / résoudre) → confirmation obligatoire.
  const [confirmAction, setConfirmAction] = useState<
    | { kind: "advance"; alerte: Alerte; label: string }
    | { kind: "resolve"; alerte: Alerte }
    | null
  >(null);
  const qc = useQueryClient();

  const actives = useQuery({
    queryKey: QUERY_KEYS.alertesActives(),
    queryFn: alerteApi.actives,
  });
  const historique = useQuery({
    queryKey: QUERY_KEYS.alertesHistorique(),
    queryFn: alerteApi.historique,
    enabled: tab === "historique",
  });
  const statuts = useQuery({
    queryKey: QUERY_KEYS.alertesStatuts(),
    queryFn: alerteApi.statuts,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.alertesActives() });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.alertesHistorique() });
  };

  const advance = useMutation({
    mutationFn: (a: Alerte) => {
      const list = statuts.data ?? [];
      const idx = list.findIndex((s) => s.id === a.statut_id);
      const next = list[idx + 1];
      if (!next) return Promise.resolve(null);
      return alerteApi.updateStatut(a.id, { statut_id: next.id });
    },
    onSuccess: () => {
      setConfirmAction(null);
      invalidate();
    },
  });

  const escalader = useMutation({
    mutationFn: (a: Alerte) =>
      alerteApi.updateStatut(a.id, {
        statut_id: a.statut_id!,
        escalade: true,
      }),
    onSuccess: () => {
      setEscaladeTarget(null);
      invalidate();
    },
  });

  const resoudre = useMutation({
    mutationFn: (id: string) => alerteApi.resoudre(id),
    onSuccess: () => {
      setConfirmAction(null);
      invalidate();
    },
  });

  const list = tab === "actives" ? (actives.data ?? []) : (historique.data ?? []);
  const isLoading = tab === "actives" ? actives.isLoading : historique.isLoading;
  const stats = statuts.data ?? [];
  const resolvedId = stats.find((s) => s.code === "RESOLU")?.id;

  return (
    <>
      <PageHeader title="Sécurité" subtitle="Alertes en direct de la cité" />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
          Alertes
        </h1>

        {/* Onglets */}
        <div className="mt-5 flex gap-1 rounded-md bg-surface-2 p-1">
          {(["actives", "historique"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-sm px-3 py-2 text-[13px] font-bold capitalize transition-colors",
                tab === t ? "bg-primary text-white" : "text-ink-3",
              )}
            >
              {t === "actives"
                ? `Actives (${actives.data?.length ?? 0})`
                : "Historique"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-4 flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            tone="teal"
            title={
              tab === "actives" ? "Aucune alerte active" : "Aucune alerte dans l'historique"
            }
            subtitle="Les alertes de sécurité de la cité apparaîtront ici en temps réel."
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {list.map((a) => {
              const idx = stats.findIndex((s) => s.id === a.statut_id);
              const next = stats[idx + 1];
              const canAdvance = canManage && tab === "actives" && next && next.id !== resolvedId;
              // Une seule opération à la fois par alerte : pas de double traitement.
              const busy =
                (advance.isPending && advance.variables?.id === a.id) ||
                (resoudre.isPending && resoudre.variables === a.id) ||
                (escalader.isPending && escalader.variables?.id === a.id);
              return (
                <div key={a.id} className="rounded-md bg-surface p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          a.escalade
                            ? "bg-danger-soft text-danger"
                            : "bg-primary-light text-primary",
                        )}
                      >
                        {a.escalade ? (
                          <Siren size={18} strokeWidth={1.7} />
                        ) : (
                          <ShieldAlert size={18} strokeWidth={1.7} />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-ink">
                          {a.motif_alerte?.libelle ?? "Alerte"}
                          {a.escalade && (
                            <span className="ml-2 rounded-pill bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                              Escaladée
                            </span>
                          )}
                        </div>
                        {a.description && (
                          <div className="mt-0.5 whitespace-pre-wrap break-words text-[13px] font-medium leading-relaxed text-ink-2">
                            {renderMessageContent(a.description)}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-3">
                          {a.villa && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} strokeWidth={2} />
                              Villa {a.villa.numero}
                              {a.villa.rue ? `, ${a.villa.rue}` : ""}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={12} strokeWidth={2} />
                            {formatRelative(a.created_at ?? "")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusPill tone={a.escalade ? "danger" : "info"} className="shrink-0">
                      {a.statut_alerte?.libelle ?? "Reçue"}
                    </StatusPill>
                  </div>

                  {tab === "actives" && canManage && (
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                      {canAdvance && (
                        <button
                          onClick={() =>
                            setConfirmAction({
                              kind: "advance",
                              alerte: a,
                              label: next!.libelle ?? "statut suivant",
                            })
                          }
                          disabled={busy}
                          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-bold text-white disabled:opacity-50"
                        >
                          {advance.isPending && advance.variables?.id === a.id ? (
                            <Spinner size={13} />
                          ) : (
                            <ArrowRight size={14} strokeWidth={2} />
                          )}
                          {next!.libelle}
                        </button>
                      )}
                      {!a.escalade && (
                        <button
                          onClick={() => setEscaladeTarget(a)}
                          disabled={busy}
                          className="rounded-md bg-danger-soft px-3 py-2 text-[12px] font-bold text-danger disabled:opacity-50"
                        >
                          {escalader.isPending && escalader.variables?.id === a.id ? (
                            <Spinner size={13} />
                          ) : (
                            "Escalader"
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmAction({ kind: "resolve", alerte: a })}
                        disabled={busy}
                        className="ml-auto flex items-center gap-1.5 rounded-md bg-emerald-soft px-3 py-2 text-[12px] font-bold text-emerald disabled:opacity-50"
                      >
                        {resoudre.isPending && resoudre.variables === a.id ? (
                          <Spinner size={13} />
                        ) : (
                          <CheckCircle2 size={14} strokeWidth={2} />
                        )}
                        Résoudre
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!escaladeTarget}
        onClose={() => setEscaladeTarget(null)}
        loading={escalader.isPending}
        title="Escalader en urgence"
        message="Les syndics et super-admins seront notifiés immédiatement de cette alerte."
        confirmLabel="Escalader"
        onConfirm={() => escaladeTarget && escalader.mutate(escaladeTarget)}
      />

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        loading={advance.isPending || resoudre.isPending}
        title={
          confirmAction?.kind === "resolve"
            ? "Résoudre l'alerte"
            : `Passer au statut « ${confirmAction?.label ?? ""} »`
        }
        message={
          confirmAction?.kind === "resolve"
            ? "L'alerte sera marquée comme résolue et retirée des alertes actives. Cette action est définitive."
            : "Le nouveau statut sera appliqué et visible par toute la cité. Confirmez-vous le traitement ?"
        }
        confirmLabel={confirmAction?.kind === "resolve" ? "Résoudre" : "Confirmer"}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.kind === "resolve") {
            resoudre.mutate(confirmAction.alerte.id);
          } else {
            advance.mutate(confirmAction.alerte);
          }
        }}
      />
    </>
  );
}
