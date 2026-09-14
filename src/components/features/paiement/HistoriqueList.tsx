"use client";

import { Ban, Check, Clock, RotateCcw, X } from "lucide-react";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth } from "@/lib/utils/formatDate";
import { statutCode } from "@/lib/utils/cotisation";
import { cn } from "@/lib/utils/cn";
import type { Paiement } from "@/types/paiement.types";

type Status = "paid" | "pending" | "failed" | "cancelled" | "refunded";

const STATUS_BY_CODE: Record<string, Status> = {
  CONFIRME: "paid",
  EN_ATTENTE: "pending",
  ECHOUE: "failed",
  ANNULE: "cancelled",
  REMBOURSE: "refunded",
};

function statusOf(p: Paiement): Status {
  const code = statutCode(p);
  return (code && STATUS_BY_CODE[code]) || "pending";
}

const ICON_CLS: Record<Status, string> = {
  paid: "bg-emerald-soft text-emerald",
  pending: "bg-gold-soft text-gold",
  failed: "bg-danger-soft text-danger",
  cancelled: "bg-surface-2 text-ink-3",
  refunded: "bg-primary-light text-primary",
};

const PILL_CLS: Record<Status, string> = {
  paid: "bg-emerald-soft text-emerald",
  pending: "bg-gold-soft text-gold",
  failed: "bg-danger-soft text-danger",
  cancelled: "bg-surface-2 text-ink-3",
  refunded: "bg-primary-light text-primary",
};

const LABEL: Record<Status, string> = {
  paid: "Payé",
  pending: "En attente",
  failed: "Échoué",
  cancelled: "Annulé",
  refunded: "Remboursé",
};

const ICON: Record<Status, typeof Check> = {
  paid: Check,
  pending: Clock,
  failed: X,
  cancelled: Ban,
  refunded: RotateCcw,
};

export function HistoriqueList({
  paiements,
  className,
}: {
  paiements: Paiement[];
  className?: string;
}) {
  return (
    <div className={cn("mx-4 overflow-hidden rounded-md bg-surface shadow-card", className)}>
      {paiements.map((p, i) => {
        const st = statusOf(p);
        const Icon = ICON[st];
        const label = p.statut_paiement?.libelle ?? LABEL[st];
        return (
          <div
            key={p.id ?? p.mois}
            className={cn(
              "flex items-center justify-between px-5 py-3.5",
              i !== paiements.length - 1 && "border-b border-border",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-sm",
                  ICON_CLS[st],
                )}
              >
                <Icon size={16} strokeWidth={1.7} />
              </div>
              <div>
                <div className="text-sm font-bold text-ink">
                  {formatMonth(p.mois)}
                </div>
                <div className="text-[11px] font-medium text-ink-3">
                  {p.canal_paiement?.libelle ?? p.reference_externe ?? "—"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[15px] font-extrabold text-ink">
                {formatFCFA(p.montant)}
              </div>
              <span
                className={cn(
                  "mt-0.5 inline-block rounded-pill px-2 py-0.5 text-[10px] font-bold",
                  PILL_CLS[st],
                )}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
