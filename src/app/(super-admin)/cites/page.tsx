"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronRight, Home, Plus, Users, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, usePeriod } from "@/components/layout/PeriodSelector";
import {
  Field,
  inputCls,
} from "@/components/features/super-admin/CiteSheets";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { citeApi } from "@/lib/api/cite";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { compactFCFA, computeGlobalStats } from "@/lib/utils/citeStats";
import { cn } from "@/lib/utils/cn";

export default function CitesPage() {
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mode, setMode, mois, setMois, debut, setDebut, fin, setFin, params, periodLabel } =
    usePeriod();

  const cites = useQuery({
    queryKey: [...QUERY_KEYS.cites(), mode, mois, debut, fin],
    queryFn: () => citeApi.list(params),
  });

  const toggle = useMutation({
    mutationFn: (c: { id: string; is_active?: boolean }) =>
      citeApi.update(c.id, { is_active: !c.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() }),
  });

  const list = cites.data ?? [];
  const stats = useMemo(() => computeGlobalStats(list), [list]);

  return (
    <>
      <PageHeader
        title="Toutes les cités"
        subtitle={`Vue agrégée · ${periodLabel}`}
        actions={
          <>
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
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} strokeWidth={2} /> Nouvelle cité
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
            Cités
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn md:hidden"
            aria-label="Nouvelle cité"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Sélecteur de période mobile */}
        <div className="mt-4 md:hidden">
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

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Cités actives" value={String(stats.actives)} icon={Building2} tone="teal" />
          <Kpi label="Habitants totaux" value={String(stats.habitants)} icon={Users} tone="purple" />
          <Kpi
            label={`Revenus (${periodLabel})`}
            value={`${compactFCFA(stats.revenus)} FCFA`}
            icon={Wallet}
            tone="gold"
          />
          <Kpi label="Taux global" value={`${stats.tauxGlobal}%`} icon={Home} tone="teal" />
        </div>

        <h2 className="mb-2 mt-6 text-[15px] font-extrabold text-ink">
          Cités déployées
        </h2>

        {cites.isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-44 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => {
              const active = c.is_active !== false;
              const taux = c.stats?.taux_recouvrement_pct ?? 0;
              const revenus = c.stats?.montant_collecte ?? 0;
              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/cites/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/cites/${c.id}`);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  className="group relative cursor-pointer overflow-hidden rounded-md bg-surface p-5 shadow-card transition-shadow hover:shadow-float pt-[21px]"
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1",
                      active
                        ? "bg-gradient-to-r from-primary to-emerald"
                        : "bg-border",
                    )}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-extrabold tracking-[-.2px] text-ink group-hover:text-accent">
                        {c.nom}
                      </div>
                      <div className="truncate text-[11px] font-semibold text-ink-3">
                        {[c.ville, c.pays].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle.mutate(c);
                      }}
                      disabled={toggle.isPending}
                      className={cn(
                        "relative h-[26px] w-11 shrink-0 rounded-pill p-[3px] transition-colors",
                        active ? "justify-end bg-emerald" : "justify-start bg-border",
                        "flex",
                      )}
                      aria-label={active ? "Désactiver" : "Activer"}
                      title={active ? "Désactiver la cité" : "Activer la cité"}
                    >
                      <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.2)]" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-lg font-extrabold tracking-[-.3px] text-ink">
                        {c.stats?.nb_villas ?? 0}
                      </div>
                      <div className="text-[10px] font-semibold text-ink-3">Villas</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold tracking-[-.3px] text-ink">
                        {c.stats?.nb_habitants ?? 0}
                      </div>
                      <div className="text-[10px] font-semibold text-ink-3">Habitants</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold tracking-[-.3px] text-ink">
                        {compactFCFA(revenus)}
                      </div>
                      <div className="text-[10px] font-semibold text-ink-3">FCFA/mois</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-[5px] flex-1 overflow-hidden rounded-pill bg-surface-2">
                      <div
                        className={cn(
                          "h-full rounded-pill",
                          taux >= 60
                            ? "bg-gradient-to-r from-emerald to-primary"
                            : "bg-gold",
                        )}
                        style={{ width: `${Math.min(taux, 100)}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-extrabold",
                        taux >= 60 ? "text-accent" : "text-gold",
                      )}
                    >
                      {taux}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-ink-3">
                      {c.stats?.nb_confirmes ?? 0}/{c.stats?.nombre_villas_attendu ?? 0} villas à jour
                    </span>
                    <span
                      className={cn(
                        "rounded-pill px-2 py-0.5 text-[10px] font-bold",
                        active
                          ? "bg-emerald-soft text-emerald"
                          : "bg-surface-2 text-ink-3 border border-border",
                      )}
                    >
                      {active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[12px] font-bold text-accent">
                    Gérer la cité
                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateCiteSheet open={open} onClose={() => setOpen(false)} />
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
      <div className="mt-2.5 truncate text-[18px] font-extrabold tracking-[-.4px] text-ink md:text-[24px]">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-ink-3 md:text-[11px]">{label}</div>
    </div>
  );
}

function CreateCiteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [nombreVillas, setNombreVillas] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      citeApi.create({
        nom: nom.trim(),
        ville: ville.trim() || undefined,
        pays: pays.trim() || undefined,
        nombre_villas_attendu:
          nombreVillas.trim() ? parseInt(nombreVillas, 10) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
      setNom("");
      setVille("");
      setPays("");
      setNombreVillas("");
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Création impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouvelle cité">
      <div className="flex flex-col gap-4">
        <Field label="Nom de la cité">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Citadelle Le Plateau"
            className={inputCls}
          />
        </Field>
        <Field label="Ville (optionnel)">
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Abidjan — Plateau"
            className={inputCls}
          />
        </Field>
        <Field label="Pays (optionnel)">
          <input
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Côte d'Ivoire"
            className={inputCls}
          />
        </Field>
        <Field label="Nombre de villas attendu (optionnel)">
          <input
            type="number"
            min={1}
            value={nombreVillas}
            onChange={(e) => setNombreVillas(e.target.value)}
            placeholder="Ex : 143"
            className={inputCls}
          />
        </Field>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          onClick={() => create.mutate()}
          disabled={nom.trim().length < 2}
          className="rounded-md py-4 text-[15px]"
        >
          Créer la cité
        </Button>
        <button onClick={onClose} className="w-full py-2 text-sm font-semibold text-ink-3">
          Annuler
        </button>
      </div>
    </BottomSheet>
  );
}