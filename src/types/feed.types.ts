/** Types du feed social — alignés sur le contrat backend (snake_case). */

export interface FeedAuthor {
  id: string;
  prenom: string;
  nom: string;
  photo_url?: string | null;
  /** Villa courante de l'auteur dans la cité du post. */
  villa?: { numero: string; rue?: string | null } | null;
}

export type FeedMediaKind = "IMAGE" | "VIDEO";
export type FeedPostType = "TEXT" | "PHOTO" | "VIDEO";

export interface FeedMedia {
  id: string;
  type: FeedMediaKind;
  file_path?: string;
  mime_type: string;
  taille_ko?: number | null;
  ordre: number;
  largeur?: number | null;
  hauteur?: number | null;
  duree_sec?: number | null;
  /** URL pré-signée MinIO (expire ~1h). */
  url?: string | null;
}

export interface FeedComment {
  id: string;
  post_id?: string;
  parent_id?: string | null;
  niveau?: number;
  texte: string;
  auteur?: FeedAuthor | null;
  created_at?: string | null;
  reponses?: FeedComment[];
}

export interface FeedPost {
  id: string;
  cite_id?: string;
  auteur_id?: string;
  auteur?: FeedAuthor | null;
  contenu?: string | null;
  media_type: FeedPostType;
  media: FeedMedia[];
  likes_count: number;
  liked_by_me: boolean;
  commentaires_count: number;
  commentaires_preview?: FeedComment[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface FeedPage {
  items: FeedPost[];
  next_cursor: string | null;
}

export interface CommentsPage {
  items: FeedComment[];
  next_cursor: string | null;
}

export interface LikeResult {
  liked: boolean;
  likes_count: number;
}

/** Métadonnées média calculées côté client avant upload. */
export interface MediaMeta {
  largeur: number | null;
  hauteur: number | null;
  duree_sec?: number | null;
}

/** Média sélectionné dans le picker avant publication. */
export interface MediaItem {
  file: File;
  url: string;
  kind: FeedMediaKind;
  meta: MediaMeta;
}
