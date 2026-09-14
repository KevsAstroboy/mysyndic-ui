export interface TypeDocument {
  id: number;
  libelle?: string;
  code: string;
  extension?: string;
}

export interface Document {
  id: string;
  titre: string;
  file_path: string;
  type_id?: number;
  type_document?: TypeDocument | null;
  taille_ko?: number;
  user?: { id: string; prenom: string; nom: string };
  created_at?: string;
}
