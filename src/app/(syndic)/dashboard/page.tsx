"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  Home,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, usePeriod } from "@/components/layout/PeriodSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { dashboardApi } from "@/lib/api/dashboard";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth } from "@/lib/utils/formatDate";

export default function DashboardPage() {
  const { mode, setMode, mois, setMois, debut, setDebut, fin, setFin, params, periodLabel, isRange } =
    usePeriod();

  const summary = useQuery({
    queryKey: ["dashboard", "summary", mode, mois, debut, fin],
    queryFn: () => dashboardApi.summary(params),
  });

  const data = summary.data;
  const recs = data?.recouvrement ?? [];
  const collecte = recs.reduce((s, r) => s + (r.montant_collecte ?? 0), 0);
  const confirmes = recs.reduce((s, r) => s + (r.nb_confirmes ?? 0), 0);
  const attendu = recs.reduce((s, r) => s + (r.nombre_villas_attendu ?? 0), 0);
  const taux = attendu > 0 ? Math.round((confirmes / attendu) * 1000) / 10 : 0;
  const impayes = data?.impayes ?? [];
  const totalImpayes = impayes.reduce((s, i) => s + (i.montant_attendu ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de votre cité"
        actions={
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
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
          Tableau de bord
        </h1>

        <div className="mt-5 md:hidden">
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

        {summary.isLoading ? (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-md" />
            ))}
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Kpi icon={Users} label="Habitants" value={String(data?.habitants ?? 0)} />
              <Kpi icon={Home} label="Villas" value={String(data?.villas?.total ?? 0)} />
              <Kpi
                icon={Wallet}
                label={isRange ? "Collecté (période)" : "Collecté ce mois"}
                value={`${formatFCFA(collecte)}`}
              />
              <Kpi icon={TrendingDown} label="Impayés" value={String(impayes.length)} accent />
            </div>

            {/* Recouvrement */}
            <div className="mt-6 rounded-md bg-surface p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-3">
                    Taux de recouvrement — {periodLabel}
                  </div>
                  <div className="mt-1 text-2xl font-extrabold tracking-[-.5px] text-ink">
                    {taux}%
                  </div>
                </div>
                <TrendingUp size={28} strokeWidth={1.5} className="text-accent" />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-pill bg-surface-2">
                <div
                  className="h-full rounded-pill bg-gradient-to-r from-primary to-emerald"
                  style={{ width: `${Math.min(taux, 100)}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-ink-3">
                <span>
                  {confirmes} paiements confirmés sur {attendu} attendus
                </span>
                <span className="font-bold text-accent">
                  {formatFCFA(collecte)} FCFA collectés
                </span>
              </div>
            </div>

            {/* Impayés */}
            {impayes.length > 0 ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[15px] font-extrabold text-ink">
                    Impayés — {periodLabel}
                  </h2>
                  <span className="rounded-pill bg-danger-soft px-3 py-1 text-[11px] font-bold text-danger">
                    {impayes.length} villa{impayes.length > 1 ? "s" : ""} ·{" "}
                    {formatFCFA(totalImpayes)} FCFA
                  </span>
                </div>

                {/* Table desktop */}
                <div className="mt-3 hidden overflow-hidden rounded-md bg-surface shadow-card md:block">
                  <div className="grid grid-cols-[1fr_1fr_130px_100px_120px] items-center border-b border-border bg-surface-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.05em] text-ink-3">
                    <div>Villa</div>
                    <div>Rue</div>
                    <div>Montant dû</div>
                    <div>Période</div>
                    <div className="text-right">Action</div>
                  </div>
                  {impayes.map((imp) => (
                    <div
                      key={imp.villa_id}
                      className="grid grid-cols-[1fr_1fr_130px_100px_120px] items-center border-b border-border px-5 py-3 last:border-b-0"
                    >
                      <div className="text-sm font-bold text-ink">
                        Villa {imp.villa_numero}
                      </div>
                      <div className="truncate pr-3 text-[12px] font-medium text-ink-3">
                        {imp.villa_rue ?? "—"}
                      </div>
                      <div className="text-sm font-bold text-danger">
                        {formatFCFA(imp.montant_attendu ?? 0)} FCFA
                      </div>
                      <div className="text-[12px] font-semibold text-ink-2">
                        {imp.nb_mois && imp.nb_mois > 1
                          ? `${imp.nb_mois} mois`
                          : formatMonth(imp.mois)}
                      </div>
                      <div className="flex justify-end">
                        <Link
                          href={`/paiements?saisie=1&mois=${imp.mois}`}
                          className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                        >
                          Saisir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cartes mobile */}
                <div className="mt-3 flex flex-col gap-2 md:hidden">
                  {impayes.map((imp) => (
                    <div
                      key={imp.villa_id}
                      className="rounded-md bg-surface p-4 shadow-card"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-ink">
                            Villa {imp.villa_numero}
                          </div>
                          <div className="truncate text-[12px] font-medium text-ink-3">
                            {imp.villa_rue ?? "—"}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-danger">
                          {formatFCFA(imp.montant_attendu ?? 0)} FCFA
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-ink-3">
                          {imp.nb_mois && imp.nb_mois > 1
                            ? `${imp.nb_mois} mois impayés`
                            : formatMonth(imp.mois)}
                        </span>
                        <Link
                          href={`/paiements?saisie=1&mois=${imp.mois}`}
                          className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold text-white"
                        >
                          Saisir paiement
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-md bg-surface p-6 text-center shadow-card">
                <Banknote size={24} strokeWidth={1.5} className="mx-auto text-emerald" />
                <p className="mt-2 text-sm font-bold text-ink">Aucun impayé</p>
                <p className="text-[12px] font-medium text-ink-3">
                  Toutes les villas sont à jour sur la période {periodLabel}.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md bg-surface p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-light text-accent">
        <Icon size={18} strokeWidth={1.7} />
      </span>
      <div
        className={`mt-3 truncate text-[20px] font-extrabold tracking-[-.3px] ${
          accent ? "text-danger" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] font-semibold text-ink-3">{label}</div>
    </div>
  );
}
