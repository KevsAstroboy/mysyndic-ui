"use client";

import { CalendarRange } from "lucide-react";
import { useMemo, useState } from "react";
import { currentMonth } from "@/lib/utils/citeStats";
import { cn } from "@/lib/utils/cn";
import { formatMonth } from "@/lib/utils/formatDate";

export interface PeriodParams {
  mois?: string;
  debut?: string;
  fin?: string;
}

/** État de sélection de période (mois unique ou plage), défaut mois courant. */
export function usePeriod() {
  const [mode, setMode] = useState<"mois" | "plage">("mois");
  const [mois, setMois] = useState(currentMonth());
  const [debut, setDebut] = useState(currentMonth());
  const [fin, setFin] = useState(currentMonth());

  const params = useMemo<PeriodParams>(() => {
    if (mode === "plage" && debut && fin) return { debut, fin };
    return { mois };
  }, [mode, mois, debut, fin]);

  const periodLabel = useMemo(() => {
    if (mode === "plage" && debut && fin)
      return `${formatMonth(debut)} — ${formatMonth(fin)}`;
    return formatMonth(mois);
  }, [mode, mois, debut, fin]);

  const isRange = mode === "plage";

  return {
    mode,
    setMode,
    mois,
    setMois,
    debut,
    setDebut,
    fin,
    setFin,
    params,
    periodLabel,
    isRange,
  };
}

export function PeriodSelector({
  mode,
  setMode,
  mois,
  setMois,
  debut,
  setDebut,
  fin,
  setFin,
  className,
}: {
  mode: "mois" | "plage";
  setMode: (m: "mois" | "plage") => void;
  mois: string;
  setMois: (v: string) => void;
  debut: string;
  setDebut: (v: string) => void;
  fin: string;
  setFin: (v: string) => void;
  className?: string;
}) {
  const inputCls =
    "rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-accent";

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 md:flex-row md:items-center",
        className,
      )}
    >
      <div className="flex gap-1 rounded-md bg-surface-2 p-1">
        {(["mois", "plage"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[12px] font-bold",
              mode === m ? "bg-primary text-white" : "text-ink-3",
            )}
          >
            {m === "mois" ? (
              "Mois"
            ) : (
              <>
                <CalendarRange size={14} strokeWidth={2} /> Plage
              </>
            )}
          </button>
        ))}
      </div>

      {mode === "mois" ? (
        <input
          type="month"
          max={currentMonth()}
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className={inputCls}
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="month"
            max={currentMonth()}
            value={debut}
            onChange={(e) => setDebut(e.target.value)}
            className={inputCls}
          />
          <span className="text-[12px] font-bold text-ink-3">→</span>
          <input
            type="month"
            max={currentMonth()}
            value={fin}
            onChange={(e) => setFin(e.target.value)}
            className={inputCls}
          />
        </div>
      )}
    </div>
  );
}
