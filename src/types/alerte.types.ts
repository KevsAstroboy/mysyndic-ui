export interface MotifAlerte {
  id: number;
  libelle?: string;
  code: string;
}

export interface StatutAlerte {
  id: number;
  libelle?: string;
  code: string;
}

export interface Alerte {
  id: string;
  cite_id?: string;
  habitant_id?: string;
  villa_id?: string;
  motif_id?: number;
  motif_alerte?: MotifAlerte | null;
  statut_id?: number;
  statut_alerte?: StatutAlerte | null;
  description?: string;
  photo_file_path?: string;
  silencieuse?: boolean;
  escalade?: boolean;
  escalade_at?: string;
  resolu_at?: string;
  created_at?: string;
  cite?: { id: string; nom: string } | null;
  villa?: { id: string; numero: string; rue?: string } | null;
}
