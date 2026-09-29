"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Home,
  Pencil,
  Plus,
  Power,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, usePeriod } from "@/components/layout/PeriodSelector";
import { CiteManager } from "@/components/features/super-admin/CiteManager";
import {
  AddVillaSheet,
  CreateSyndicSheet,
  EditCiteSheet,
} from "@/components/features/super-admin/CiteSheets";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { citeApi } from "@/lib/api/cite";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { cn } from "@/lib/utils/cn";
import { compactFCFA } from "@/lib/utils/citeStats";
import { formatFCFA } from "@/lib/utils/formatFCFA";

export default function CiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [openVilla, setOpenVilla] = useState(false);
  const [openSyndic, setOpenSyndic] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const {
    mode,
    setMode,
    mois,
    setMois,
    debut,
    setDebut,
    fin,
    setFin,
    params: periodParams,
    periodLabel,
  } = usePeriod();

  const cites = useQuery({
    queryKey: [...QUERY_KEYS.cites(), mode, mois, debut, fin],
    queryFn: () => citeApi.list(periodParams),
  });
  const cite = cites.data?.find((c) => c.id === id);

  const toggle = useMutation({
    mutationFn: () => citeApi.update(id, { is_active: !cite?.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() }),
  });

  const active = cite?.is_active !== false;
  const revenus = cite?.stats?.montant_collecte ?? 0;
  const taux = cite?.stats?.taux_recouvrement_pct ?? 0;
  const confirmes = cite?.stats?.nb_confirmes ?? 0;
  const attendu = cite?.stats?.nombre_villas_attendu ?? 0;
  const citeNom = cite?.nom ?? "Cité";

  const subtitle = [
    [cite?.ville, cite?.pays].filter(Boolean).join(" · ") || null,
    periodLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        title={citeNom}
        subtitle={subtitle}
        actions={
          <>
            <Button
              variant={active ? "secondary" : "primary"}
              size="sm"
              loading={toggle.isPending}
              onClick={() => toggle.mutate()}
              title={active ? "Désactiver la cité" : "Activer la cité"}
            >
              <Power size={14} strokeWidth={2} />
              {active ? "Désactiver" : "Activer"}
            </Button>
            <Button size="sm" onClick={() => setOpenVilla(true)}>
              <Plus size={14} strokeWidth={2} /> Ajouter une villa
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOpenSyndic(true)}>
              <UserRound size={14} strokeWidth={2} /> Créer le syndic
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOpenEdit(true)}>
              <Pencil size={14} strokeWidth={2} /> Modifier
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-5 md:px-7">
        {/* En-tête mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold tracking-[-.3px] text-ink">
              {citeNom}
            </h1>
            {cite && (
              <p className="truncate text-[11px] font-medium text-ink-3">
                {[cite.ville, cite.pays, periodLabel].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <button
            onClick={() => setOpenEdit(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Modifier la cité"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
            className={cn(
              "relative h-[26px] w-11 shrink-0 rounded-pill p-[3px] transition-colors",
              "flex",
              active ? "justify-end bg-emerald" : "justify-start bg-border",
            )}
            aria-label={active ? "Désactiver" : "Activer"}
            title={active ? "Désactiver la cité" : "Activer la cité"}
          >
            <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.2)]" />
          </button>
        </div>

        {/* Sélecteur de période */}
        <div className="mt-4 flex justify-end md:mt-6">
          <PeriodSelector
            mode={mode}
            setMode={setMode}
            mois={mois}
            setMois={setMois}
            debut={debut}
            setDebut={setDebut}
            fin={fin}
            setFin={setFin}
          />
        </div>

        {cites.isLoading ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-36 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </div>
          </div>
        ) : !cite ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-surface px-5 py-12 text-center">
            <Building2 size={28} strokeWidth={1.5} className="text-ink-3" />
            <p className="text-sm font-bold text-ink">Cité introuvable</p>
            <p className="text-[12px] font-medium text-ink-3">
              Elle a peut-être été supprimée ou vous n'avez pas accès.
            </p>
            <Button size="sm" variant="secondary" onClick={() => router.push("/cites")}>
              <ArrowLeft size={14} strokeWidth={2} /> Retour aux cités
            </Button>
          </div>
        ) : (
          <>
            {/* Hero revenus */}
            <div
              className="relative mt-4 overflow-hidden rounded-xl p-5 md:p-6"
              style={{
                background:
                  "linear-gradient(145deg, #0D6E5A 0%, #083D31 60%, #052820 100%)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[.08em] text-white/55">
                    Revenus collectés — {periodLabel}
                  </div>
                  <div className="mt-1 text-[30px] font-extrabold leading-none tracking-[-.5px] text-white md:text-[36px]">
                    {formatFCFA(revenus)} FCFA
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-pill px-3 py-1 text-[11px] font-bold",
                    active ? "bg-white/15 text-white" : "bg-white/10 text-white/60",
                  )}
                >
                  {active ? "Cité active" : "Cité inactive"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white/55">
                <CheckCircle2 size={14} strokeWidth={1.7} />
                {confirmes}/{attendu || "—"} villas à jour · taux de recouvrement{" "}
                {taux}%
              </div>
            </div>

            {/* Stats */}
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi label="Villas créées" value={String(cite.stats?.nb_villas ?? 0)} icon={Home} tone="teal" />
              <Kpi label="Habitants" value={String(cite.stats?.nb_habitants ?? 0)} icon={Users} tone="purple" />
              <Kpi label="Taux de recouvrement" value={`${taux}%`} icon={TrendingUp} tone="gold" />
              <Kpi label={`Villas à jour (${periodLabel})`} value={`${compactFCFA(revenus)} FCFA`} icon={Wallet} tone="gold" />
            </div>

            {/* Gestion */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-extrabold tracking-[-.2px] text-ink">
                  Gestion de la cité
                </h2>
                <span className="text-[11px] font-semibold text-ink-3">
                  Villas · Comptes · Configuration
                </span>
              </div>
              <div className="mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-card">
                <CiteManager
                  citeId={cite.id}
                  citeNom={cite.nom}
                  onAddVilla={() => setOpenVilla(true)}
                  onAddSyndic={() => setOpenSyndic(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <AddVillaSheet
        cite={openVilla ? { id, nom: cite?.nom ?? "" } : null}
        onClose={() => setOpenVilla(false)}
      />
      <CreateSyndicSheet
        cite={openSyndic ? { id, nom: cite?.nom ?? "" } : null}
        onClose={() => setOpenSyndic(false)}
      />
      <EditCiteSheet
        cite={
          openEdit
            ? {
                id,
                nom: cite?.nom ?? "",
                ville: cite?.ville,
                pays: cite?.pays,
                nombre_villas_attendu: cite?.stats?.nombre_villas_attendu,
              }
            : null
        }
        onClose={() => setOpenEdit(false)}
      />
    </>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: "teal" | "gold" | "purple";
}) {
  const tones = {
    teal: "bg-primary-light text-accent",
    gold: "bg-gold-soft text-gold",
    purple: "bg-purple-soft text-purple",
  };
  return (
    <div className="rounded-md bg-surface p-3.5 shadow-card md:p-4">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-sm", tones[tone])}>
        <Icon size={16} strokeWidth={1.7} />
      </span>
      <div className="mt-2.5 truncate text-[18px] font-extrabold tracking-[-.4px] text-ink md:text-[22px]">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-ink-3 md:text-[11px]">{label}</div>
    </div>
  );
}