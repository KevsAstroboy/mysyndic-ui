"use client";

import { motion } from "framer-motion";
import { MonthBars } from "./MonthBars";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth } from "@/lib/utils/formatDate";
import { cn } from "@/lib/utils/cn";
import type { MonthStatus } from "@/lib/utils/cotisation";

export interface HeroCardProps {
  mois: string;
  montant: number;
  statut:
    | "CONFIRME"
    | "EN_ATTENTE"
    | "ECHOUE"
    | "ANNULE"
    | "REMBOURSE"
    | "IMPAYE";
  months: MonthStatus[];
  villaNumero?: string;
  villaRue?: string;
  onPayer: () => void;
  className?: string;
}

const STATUS_MAP = {
  CONFIRME: { label: "Payé", cls: "bg-[rgba(0,168,124,.25)] text-[#5DFFC8]" },
  EN_ATTENTE: { label: "En attente", cls: "bg-[rgba(232,160,32,.22)] text-[#FFD166]" },
  ECHOUE: { label: "Échoué", cls: "bg-[rgba(232,69,60,.22)] text-[#FF8080]" },
  ANNULE: { label: "Annulé", cls: "bg-[rgba(255,255,255,.14)] text-white/75" },
  REMBOURSE: { label: "Remboursé", cls: "bg-[rgba(96,165,250,.22)] text-[#9CC3FF]" },
  IMPAYE: { label: "Impayé", cls: "bg-[rgba(232,69,60,.22)] text-[#FF8080]" },
};

export function HeroCard({
  mois,
  montant,
  statut,
  months,
  villaNumero,
  villaRue,
  onPayer,
  className,
}: HeroCardProps) {
  const status = STATUS_MAP[statut] ?? STATUS_MAP.IMPAYE;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "var(--shadow-float)" }}
      transition={{ duration: 0.15 }}
      className={cn(
        "relative mt-1 overflow-hidden rounded-xl p-6 shadow-[0_8px_32px_rgba(13,110,90,.30)]",
        className,
      )}
      style={{
        background:
          "linear-gradient(145deg, #0D6E5A 0%, #083D31 60%, #052820 100%)",
      }}
    >
      {/* Motif kente */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,.025) 0px, rgba(255,255,255,.025) 1px, transparent 1px, transparent 14px), repeating-linear-gradient(-45deg, rgba(255,255,255,.025) 0px, rgba(255,255,255,.025) 1px, transparent 1px, transparent 14px)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-[1] mb-5 flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold tracking-[.08em] text-white/55">
            Cotisation
          </div>
          <div className="mt-0.5 text-[13px] font-bold text-white/80">
            {formatMonth(mois)}
          </div>
        </div>
        <span className={`rounded-pill px-3 py-[5px] text-[11px] font-bold ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="relative z-[1] mb-1 text-[38px] font-extrabold leading-none tracking-[-1px] text-white">
        {formatFCFA(montant)}
      </div>
      <div className="relative z-[1] text-xs font-medium text-white/50">
        FCFA · Villa {villaNumero ?? "—"}, {villaRue ?? "—"}
      </div>

      <div className="relative z-[1] mt-5">
        <MonthBars months={months} />
      </div>

      <button
        onClick={onPayer}
        className="relative z-[1] mt-5 w-full rounded-md border border-white/18 bg-white/13 py-3.5 text-center text-sm font-bold tracking-[-.1px] text-white backdrop-blur-[8px]"
      >
        Payer ma cotisation
      </button>
    </motion.div>
  );
}
