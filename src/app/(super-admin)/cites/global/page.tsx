"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Home, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, usePeriod } from "@/components/layout/PeriodSelector";
import { Skeleton } from "@/components/ui/Skeleton";
import { citeApi } from "@/lib/api/cite";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { computeGlobalStats } from "@/lib/utils/citeStats";
import { cn } from "@/lib/utils/cn";
import { formatFCFA } from "@/lib/utils/formatFCFA";

export default function VueGlobalePage() {
  const { mode, setMode, mois, setMois, debut, setDebut, fin, setFin, params, periodLabel } =
    usePeriod();

  const cites = useQuery({
    queryKey: [...QUERY_KEYS.cites(), mode, mois, debut, fin],
    queryFn: () => citeApi.list(params),
  });

  const list = cites.data ?? [];
  const stats = useMemo(() => computeGlobalStats(list), [list]);

  return (
    <>
      <PageHeader
        title="Vue globale"
        subtitle={`Consolidé de la plateforme · ${periodLabel}`}
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
          Vue globale
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

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Cités" value={String(stats.total)} icon={Building2} />
          <Kpi label="Habitants" value={String(stats.habitants)} icon={Users} />
          <Kpi label="Villas" value={String(stats.villas)} icon={Home} />
          <Kpi label="Taux global" value={`${stats.tauxGlobal}%`} icon={TrendingUp} />
        </div>

        {cites.isLoading ? (
          <div className="mt-6 flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-md bg-surface shadow-card">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center border-b border-border bg-surface-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.05em] text-ink-3 md:grid-cols-[1.4fr_80px_80px_80px_110px]">
              <div>Cité</div>
              <div className="text-right">Villas</div>
              <div className="text-right">Habitants</div>
              <div className="text-right">Taux</div>
              <div className="hidden text-right md:block">Revenus</div>
            </div>
            {list.map((c) => {
              const taux = c.stats?.taux_recouvrement_pct ?? 0;
              return (
                <div
                  key={c.id}
                  className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[1.4fr_80px_80px_80px_110px]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-ink">{c.nom}</div>
                    <div className="truncate text-[11px] font-medium text-ink-3">
                      {[c.ville, c.pays].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="text-right text-[12px] font-semibold text-ink-2">
                    {c.stats?.nb_villas ?? 0}
                  </div>
                  <div className="text-right text-[12px] font-semibold text-ink-2">
                    {c.stats?.nb_habitants ?? 0}
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-[12px] font-bold",
                        taux >= 60 ? "text-accent" : "text-gold",
                      )}
                    >
                      {taux}%
                    </span>
                  </div>
                  <div className="hidden text-right text-[12px] font-semibold text-ink-2 md:block">
                    {formatFCFA(c.stats?.montant_collecte ?? 0)}
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

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-md bg-surface p-3.5 shadow-card md:p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-light text-accent">
        <Icon size={16} strokeWidth={1.7} />
      </span>
      <div className="mt-2.5 text-[20px] font-extrabold tracking-[-.4px] text-ink md:text-[26px]">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-ink-3 md:text-[11px]">{label}</div>
    </div>
  );
}
