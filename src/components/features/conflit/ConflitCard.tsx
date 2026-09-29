"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import type { Conflit } from "@/types/conflit.types";

const STATUT_TONE: Record<number, string> = {
  1: "bg-gold-soft text-gold",
  2: "bg-primary-light text-accent",
  3: "bg-emerald-soft text-emerald",
  4: "bg-surface-2 text-ink-3",
};

/** Villa concernée : relation (numéro + rue) quand dispo, sinon le numéro. */
function villaLabel(c: Conflit): string {
  const rel = c.villa_conflit_villa_ciblee_idTovilla;
  if (rel?.numero) {
    return rel.rue ? `Villa ${rel.numero}, ${rel.rue}` : `Villa ${rel.numero}`;
  }
  return c.villa_ciblee_num ? `Villa ${c.villa_ciblee_num}` : "Villa —";
}

export function ConflitCard({
  conflit,
  className,
}: {
  conflit: Conflit;
  className?: string;
}) {
  const statutId = conflit.statut_id ?? conflit.statut?.id ?? 1;
  return (
    <div className={cn("mx-4 mb-2.5 rounded-md bg-surface p-4 shadow-card", className)}>
      <div className="mb-2 flex items-center justify-between">
        {conflit.categorie && (
          <span className="rounded-pill bg-danger-soft px-2.5 py-1 text-[10px] font-bold text-danger">
            {conflit.categorie.libelle ?? conflit.categorie.code}
          </span>
        )}
        <span
          className={cn(
            "rounded-pill px-2.5 py-1 text-[10px] font-bold",
            STATUT_TONE[statutId] ?? STATUT_TONE[1],
          )}
        >
          {conflit.statut?.libelle ?? "Signalé"}
        </span>
      </div>
      <p className="mb-2 text-[13px] font-medium leading-relaxed text-ink-2">
        {conflit.description}
      </p>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-3">
        <MapPin size={12} strokeWidth={2} className="shrink-0 text-accent" />
        <span className="min-w-0 flex-1 truncate">{villaLabel(conflit)}</span>
        <span>· {formatRelative(conflit.created_at ?? "")}</span>
      </div>
    </div>
  );
}
