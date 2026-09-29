"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * Déconnexion : purge la session (store + cookie) puis recharge l'application
 * sur /login en navigation « pleine page ».
 *
 * On évite volontairement `router.replace` : entre la purge du store et la fin
 * de la navigation douce, les écrans protégés se re-rendent une fois avec
 * `user`/cache vides, ce qui déclenche une erreur runtime (overlay Next). Le
 * rechargement complet court-circuite cet état intermédiaire et repart propre.
 */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useCallback(() => {
    logout();
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, [logout]);
}
