export interface RecouvrementMois {
  cite_id?: string;
  nom_cite?: string;
  mois: string;
  nb_villas_enregistrees?: number;
  nb_confirmes?: number;
  montant_collecte?: number;
  nombre_villas_attendu?: number;
  taux_recouvrement_pct?: number;
}

export interface ImpayeMois {
  cite_id?: string;
  nom_cite?: string;
  villa_id: string;
  villa_numero: string;
  villa_rue?: string;
  montant_attendu?: number;
  mois: string;
  mois_debut?: string;
  nb_mois?: number;
}

export interface DashboardSummary {
  cite_id: string;
  habitants: number;
  occupants_confirmes: number;
  villas: { total: number };
  recouvrement: RecouvrementMois[];
  impayes: ImpayeMois[];
  generated_at?: string;
}
