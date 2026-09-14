export interface VillaCourante {
  id: string;
  numero: string;
  rue?: string;
}

export interface MeResponse {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  photo_file_path?: string;
  villa?: VillaCourante | null;
  occupation_confirmee?: boolean;
  cite?: { id: string; nom: string } | null;
}

export interface User {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  photo_file_path?: string;
  is_active?: boolean;
  must_change_password?: boolean;
  created_at?: string;
  roles?: { code: string; libelle?: string }[];
  villa?: { id: string; numero: string; rue?: string } | null;
}
