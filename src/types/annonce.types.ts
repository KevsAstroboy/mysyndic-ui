export interface CategorieAnnonce {
  id: number;
  libelle?: string;
  code: string;
}

export interface Annonce {
  id: string;
  titre: string;
  contenu: string;
  est_epinglee?: boolean;
  categorie_id?: number;
  categorie?: CategorieAnnonce | null;
  user?: { id: string; prenom: string; nom: string };
  created_at?: string;
}
