export type ClassValue = string | number | boolean | null | undefined;

/** Concatène des classes conditionnelles (sans dépendance externe). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
