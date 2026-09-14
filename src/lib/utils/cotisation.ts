import type { Paiement } from "@/types/paiement.types";

export type MonthStatus = "paid" | "current" | "future" | "overdue";

export const STATUT_CONFIRME = 2;

/** Tables de correspondance — la base fait foi (`statut_paiement`). */
const CODE_BY_ID: Record<number, string> = {
  1: "EN_ATTENTE",
  2: "CONFIRME",
  3: "ECHOUE",
  4: "REMBOURSE",
  5: "ANNULE",
};

/**
 * Code de statut d'un paiement, source de vérité = base de données.
 * Priorité à `statut_paiement.code` ; repli sur `statut_id` si l'API ne renvoie
 * pas la relation (jamais l'inverse : l'id ne doit pas écraser le code DB).
 */
export function statutCode(p: {
  statut_id?: number;
  statut_paiement?: { code?: string } | null;
}): string | undefined {
  return (
    p.statut_paiement?.code ??
    (p.statut_id != null ? CODE_BY_ID[p.statut_id] : undefined)
  );
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 12 statuts de l'année courante à partir de l'historique des paiements. */
export function compute12Months(
  paiements: Paiement[],
  moisCourant: string,
): MonthStatus[] {
  const [year, month] = moisCourant.split("-").map(Number);
  const res: MonthStatus[] = [];
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const paid = paiements.some(
      (p) => p.mois === key && p.statut_id === STATUT_CONFIRME,
    );
    if (paid) res.push("paid");
    else if (m === month) res.push("current");
    else if (m < month) res.push("overdue");
    else res.push("future");
  }
  return res;
}
