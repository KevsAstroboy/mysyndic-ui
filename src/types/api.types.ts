/**
 * Enveloppes API — MySyndic.
 *
 * Note : le backend applique un "null-cleaning" récursif : les clés nulles ou
 * absentes sont retirées de la réponse. Tous les champs d'entités doivent donc
 * être traités comme optionnels (jamais `null` garanti).
 */

/** Réponse paginée des endpoints `GET .../get-by-criteria`. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** Requête DSL pour `get-by-criteria` (filtres `champ.op=valeur`). */
export type GetByCriteriaQuery = Record<
  string,
  string | number | boolean | undefined
>;

/** Identifiants communs à toutes les entités soft-deleted. */
export interface AuditFields {
  id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  is_deleted?: boolean;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}
