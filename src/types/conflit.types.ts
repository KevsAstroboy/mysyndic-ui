export interface CategorieConflit {
  id: number;
  libelle?: string;
  code: string;
}

export interface StatutConflit {
  id: number;
  libelle?: string;
  code: string;
}

export interface Conflit {
  id: string;
  description: string;
  villa_ciblee_num: string;
  categorie_id?: number;
  categorie?: CategorieConflit | null;
  statut_id?: number;
  statut?: StatutConflit | null;
  note_syndic?: string;
  resolution_note?: string;
  pris_en_charge_at?: string;
  resolu_at?: string;
  created_at?: string;
  user_conflit_declarant_idTouser?: { id: string; prenom: string; nom: string };
  villa_conflit_villa_ciblee_idTovilla?: { id: string; numero: string; rue?: string };
}
