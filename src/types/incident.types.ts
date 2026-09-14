export interface CategorieIncident {
  id: number;
  libelle?: string;
  code: string;
  icon_name?: string;
}

export interface StatutIncident {
  id: number;
  libelle?: string;
  code: string;
}

export interface Auteur {
  id: string;
  prenom: string;
  nom: string;
}

export interface Incident {
  id: string;
  cite_id?: string;
  auteur_id?: string;
  auteur?: Auteur;
  categorie?: CategorieIncident | null;
  categorie_id?: number;
  statut?: StatutIncident | null;
  titre?: string;
  description: string;
  photo_file_path?: string;
  note_syndic?: string;
  resolu_at?: string;
  created_at?: string;
  likes_count: number;
  liked_by_me: boolean;
  commentaires_count?: number;
  villa?: { id: string; numero: string; rue?: string } | null;
}

export interface IncidentCommentaire {
  id: string;
  texte: string;
  niveau?: number;
  parent_id?: string;
  auteur?: Auteur;
  created_at?: string;
  reponses?: IncidentCommentaire[];
}

export interface IncidentDetail extends Incident {
  commentaires?: IncidentCommentaire[];
}
