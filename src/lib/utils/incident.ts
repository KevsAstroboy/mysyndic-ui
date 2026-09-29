import type { IncidentCommentaire } from "@/types/incident.types";

/**
 * Nombre total de commentaires d'un incident, réponses imbriquées incluses.
 *
 * Le endpoint « détail » renvoie l'arbre `commentaires` (sans `commentaires_count`) :
 * on recompte donc côté client, en descendant les `reponses`.
 */
export function countCommentaires(
  commentaires?: IncidentCommentaire[] | null,
): number {
  if (!commentaires?.length) return 0;
  return commentaires.reduce(
    (total, c) => total + 1 + countCommentaires(c.reponses),
    0,
  );
}
