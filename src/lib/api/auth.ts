import { api } from "./axios";
import type {
  AuthResponse,
  PublicCite,
  PublicVilla,
  RegisterResponse,
} from "@/types/auth.types";

export interface RegisterDto {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  password: string;
  villa_id: string;
}

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { identifier, password }).then((r) => r.data),

  register: (dto: RegisterDto) =>
    api.post<RegisterResponse>("/auth/register", dto).then((r) => r.data),

  activate: (email: string, otp_code: string) =>
    api.post<AuthResponse>("/auth/activate", { email, otp_code }).then((r) => r.data),

  resendActivation: (email: string) =>
    api.post<{ message?: string }>("/auth/activate/resend", { email }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<{ message?: string }>("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (email: string, otp_code: string, new_password: string) =>
    api
      .post<{ message?: string }>("/auth/reset-password", { email, otp_code, new_password })
      .then((r) => r.data),

  changePassword: (old_password: string, new_password: string) =>
    api
      .post<{ message?: string }>("/auth/change-password", { old_password, new_password })
      .then((r) => r.data),

  refresh: (refresh_token: string) =>
    api.post<AuthResponse>("/auth/refresh", { refresh_token }).then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  profils: () => api.get("/auth/profils").then((r) => r.data),

  switchContext: (user_profil_id: string) =>
    api.post<AuthResponse>("/auth/context", { user_profil_id }).then((r) => r.data),
};

export const publicApi = {
  cites: () => api.get<PublicCite[]>("/public/cites").then((r) => r.data),

  villas: (citeId: string) =>
    api.get<PublicVilla[]>(`/public/cites/${citeId}/villas`).then((r) => r.data),
};
