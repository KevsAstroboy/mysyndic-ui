"use client";

import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, usePeriod } from "@/components/layout/PeriodSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { citeApi } from "@/lib/api/cite";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { computeGlobalStats } from "@/lib/utils/citeStats";
import { cn } from "@/lib/utils/cn";
import { formatFCFA } from "@/lib/utils/formatFCFA";

export default function RevenusPage() {
  const { mode, setMode, mois, setMois, debut, setDebut, fin, setFin, params, periodLabel, isRange } =
    usePeriod();

  const cites = useQuery({
    queryKey: [...QUERY_KEYS.cites(), mode, mois, debut, fin],
    queryFn: () => citeApi.list(params),
  });

  const list = cites.data ?? [];
  const stats = useMemo(() => computeGlobalStats(list), [list]);

  const maxRevenus = Math.max(1, ...list.map((c) => c.stats?.montant_collecte ?? 0));

  return (
    <>
      <PageHeader
        title="Revenus"
        subtitle={`Cotisations collectées · ${periodLabel}`}
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
          Revenus
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

        {/* Total */}
        <div
          className="relative mt-4 overflow-hidden rounded-xl p-6 shadow-[0_8px_32px_rgba(13,110,90,.30)]"
          style={{
            background: "linear-gradient(145deg, #0D6E5A 0%, #083D31 60%, #052820 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-white/15 text-white">
              <Wallet size={20} strokeWidth={1.7} />
            </span>
            <div>
              <div className="text-[11px] font-semibold tracking-[.08em] text-white/55">
                Total collecté — {periodLabel}
              </div>
              <div className="mt-0.5 text-[28px] font-extrabold leading-none tracking-[-.5px] text-white md:text-[34px]">
                {formatFCFA(stats.revenus)} FCFA
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs font-medium text-white/55">
            {stats.confirmes} villas à jour sur {stats.attendu} attendues · taux{" "}
            {stats.tauxGlobal}%
          </div>
        </div>

        {cites.isLoading ? (
          <div className="mt-6 flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {list.map((c) => {
              const revenus = c.stats?.montant_collecte ?? 0;
              const taux = c.stats?.taux_recouvrement_pct ?? 0;
              const pct = Math.round((revenus / maxRevenus) * 100);
              return (
                <div key={c.id} className="rounded-md bg-surface p-4 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-ink">{c.nom}</div>
                      <div className="text-[11px] font-medium text-ink-3">
                        {c.stats?.nb_confirmes ?? 0}/{c.stats?.nombre_villas_attendu ?? 0} villas ·{" "}
                        {taux}%
                      </div>
                    </div>
                    <div className="text-sm font-bold text-ink">
                      {formatFCFA(revenus)} FCFA
                    </div>
                  </div>
                  <div className="mt-2 h-[6px] overflow-hidden rounded-pill bg-surface-2">
                    <div
                      className="h-full rounded-pill bg-gradient-to-r from-primary to-emerald"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
