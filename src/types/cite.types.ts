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

export type OccupStatut = "libre" | "occupee" | "en_attente";

/** Villa vue par le super admin (gestion cité). */
export interface SaVilla {
  id: string;
  numero: string;
  rue?: string;
  description?: string;
  is_active: boolean;
  statut: OccupStatut;
  a_pending: boolean;
  nb_occupants_confirmes: number;
}

/** Configuration d'une cité (super admin). */
export interface CiteConfiguration {
  id: string;
  cite_id: string;
  cotisation_mensuelle?: number | null;
  lien_wave?: string | null;
  telephone_syndic?: string | null;
  telephone_urgence?: string | null;
  paystack_subaccount_code?: string | null;
  paystack_subaccount_mode?: "SIMPLE" | "SPLIT" | null;
  paystack_subaccount_split?: number | null;
  /** Commission plateforme du sous-compte (% de chaque paiement) — renvoyé par GET config pour la protection anti-cumul. */
  percentage_charge?: number | null;
  nombre_villas_attendu?: number | null;
  modifier?: { id: string; prenom: string; nom: string } | null;
}
