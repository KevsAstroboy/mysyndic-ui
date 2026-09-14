export interface CiteStats {
  nb_villas?: number;
  nb_habitants?: number;
  mois?: string;
  nb_confirmes?: number;
  nombre_villas_attendu?: number;
  montant_collecte?: number;
  taux_recouvrement_pct?: number;
}

export interface Cite {
  id: string;
  nom: string;
  ville?: string;
  pays?: string;
  is_active?: boolean;
  created_at?: string;
  stats?: CiteStats;
}
