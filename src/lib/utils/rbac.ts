import type { AuthResponse } from "@/types/auth.types";

/** Dashboard par rôle (redirection post-login + middleware). */
export const ROLE_ROUTES: Record<string, string> = {
  SUPER_ADMIN: "/cites",
  ADMIN: "/comptes",
  SYNDIC: "/dashboard",
  CHEF_SECURITE: "/alertes",
  HABITANT: "/accueil",
};

/** Préfixes de routes et rôles autorisés (middleware). */
export const ROLE_PATHS: Record<string, string[]> = {
  "/cites": ["SUPER_ADMIN"],
  "/profils": ["SUPER_ADMIN"],
  "/comptes": ["ADMIN", "SYNDIC"],
  "/configuration": ["ADMIN", "SYNDIC"],
  "/dashboard": ["SYNDIC"],
  "/paiements": ["SYNDIC"],
  "/habitants": ["SYNDIC"],
  "/incidents": ["SYNDIC"],
  "/annonces": ["SYNDIC"],
  "/conflits": ["SYNDIC"],
  "/documents": ["SYNDIC"],
  "/alertes": ["SYNDIC", "CHEF_SECURITE"],
  "/accueil": ["HABITANT"],
  "/cotisation": ["HABITANT"],
  "/quartier": ["SYNDIC", "ADMIN", "SUPER_ADMIN", "CHEF_SECURITE", "HABITANT"],
  "/feed": ["SYNDIC", "ADMIN", "SUPER_ADMIN", "CHEF_SECURITE", "HABITANT"],
  "/messages": ["SYNDIC", "ADMIN", "SUPER_ADMIN", "CHEF_SECURITE", "HABITANT"],
  "/profil": ["SYNDIC", "ADMIN", "SUPER_ADMIN", "CHEF_SECURITE", "HABITANT"],
};

export function routeForRole(role: string | null | undefined): string {
  return (role && ROLE_ROUTES[role]) || "/accueil";
}

/** Rôles staff → layout `RoleShell` (barre mobile intégrée). Les autres → layout habitant nu. */
export const STAFF_ROLES = [
  "SYNDIC",
  "ADMIN",
  "SUPER_ADMIN",
  "CHEF_SECURITE",
] as const;

export function isStaffRole(code?: string | null): boolean {
  return !!code && (STAFF_ROLES as readonly string[]).includes(code);
}

/** Détermine la destination après une réponse d'auth complète. */
export function redirectAfterAuth(data: AuthResponse): string {
  if (data.user.must_change_password) return "/change-password";
  const profilActif =
    data.profils.find((p) => p.userProfilId === data.profil_actif_user_profil_id) ??
    data.profils[0];
  if (data.profils.length > 1) return "/profil-switcher";
  return routeForRole(profilActif?.code);
}
