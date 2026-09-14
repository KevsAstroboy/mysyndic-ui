export interface Villa {
  id: string;
  numero: string;
  rue?: string;
  description?: string;
}

/** Cité visible à l'onboarding / self-service d'adhésion. */
export interface PublicCite {
  id: string;
  nom: string;
  ville?: string;
  pays?: string;
}

/** Villa publique + état d'occupation (dérivé de user_villa). */
export interface PublicVilla {
  id: string;
  numero: string;
  rue?: string;
  description?: string;
  statut: "libre" | "occupee" | "en_attente";
  a_pending: boolean;
  nb_occupants_confirmes: number;
}
