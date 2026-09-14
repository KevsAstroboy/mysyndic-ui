/** Formate un montant en FCFA : 25000 → "25 000". */
export function formatFCFA(montant: number): string {
  return new Intl.NumberFormat("fr-FR").format(montant);
}
