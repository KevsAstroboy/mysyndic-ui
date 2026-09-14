/** Types auth — alignés sur AuthResponseDto du backend. */

export interface AuthUser {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  is_active: boolean;
  must_change_password: boolean;
}

export interface AuthProfil {
  userProfilId: string;
  profilId: number;
  libelle: string;
  code: string;
  citeId?: string;
  citeNom?: string;
  orderPriority: number;
}

export interface AuthResponse {
  user: AuthUser;
  profils: AuthProfil[];
  profil_actif_user_profil_id?: string;
  features: string[];
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  requires_activation: boolean;
  occupation_en_attente: boolean;
}

export interface PublicCite {
  id: string;
  nom: string;
  ville?: string;
  pays?: string;
}

export type VillaStatut = "libre" | "occupee" | "en_attente";

export interface PublicVilla {
  id: string;
  numero: string;
  rue?: string;
  description?: string;
  statut: VillaStatut;
  a_pending?: boolean;
  nb_occupants_confirmes?: number;
}
