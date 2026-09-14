import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/lib/store/authStore";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  // Le backend expose un préfixe global `api` (app.setGlobalPrefix('api')).
  baseURL: `${API_BASE}/api`,
});

interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Redirection pleine page anti-boucle : une seule fois, et jamais si on est
 * déjà sur la page cible. Sans ce garde-fou, un 403 `MUST_CHANGE_PASSWORD`
 * déclenché par un composant global (toaster, etc.) recharge `/change-password`
 * en boucle.
 */
let redirecting = false;
function hardRedirect(path: string) {
  if (typeof window === "undefined" || redirecting) return;
  if (window.location.pathname === path) return;
  redirecting = true;
  window.location.href = path;
}

// Inject access_token sur chaque requête.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh automatique sur 401 + redirections métier.
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ code?: string }>) => {
    const original = error.config as (typeof error.config & {
      _retry?: boolean;
    }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const { data } = await axios.post<AuthTokenResponse>(
            `${api.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
          );
          useAuthStore
            .getState()
            .setTokens(data.access_token, data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          useAuthStore.getState().logout();
          hardRedirect("/login");
          return Promise.reject(error);
        }
      }

      useAuthStore.getState().logout();
      hardRedirect("/login");
    }

    if (error.response?.data?.code === "MUST_CHANGE_PASSWORD") {
      hardRedirect("/change-password");
    }

    // Cité désactivée → on déconnecte (la session est devenue inutilisable).
    if (error.response?.status === 403 && error.response?.data?.code === "CITE_INACTIVE") {
      useAuthStore.getState().logout();
      hardRedirect("/login");
    }

    return Promise.reject(error);
  },
);
