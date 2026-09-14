import type { Cite } from "@/types/cite.types";

export interface GlobalStats {
  actives: number;
  total: number;
  villas: number;
  habitants: number;
  revenus: number;
  confirmes: number;
  attendu: number;
  tauxGlobal: number;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function computeGlobalStats(cites: Cite[]): GlobalStats {
  const actives = cites.filter((c) => c.is_active !== false).length;
  const villas = cites.reduce((s, c) => s + (c.stats?.nb_villas ?? 0), 0);
  const habitants = cites.reduce((s, c) => s + (c.stats?.nb_habitants ?? 0), 0);
  const revenus = cites.reduce((s, c) => s + (c.stats?.montant_collecte ?? 0), 0);
  const confirmes = cites.reduce((s, c) => s + (c.stats?.nb_confirmes ?? 0), 0);
  const attendu = cites.reduce((s, c) => s + (c.stats?.nombre_villas_attendu ?? 0), 0);
  const tauxGlobal = attendu > 0 ? Math.round((confirmes / attendu) * 1000) / 10 : 0;

  return {
    actives,
    total: cites.length,
    villas,
    habitants,
    revenus,
    confirmes,
    attendu,
    tauxGlobal,
  };
}
