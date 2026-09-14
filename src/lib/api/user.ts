import { api } from "./axios";
import type { MeResponse, User } from "@/types/user.types";

export const userApi = {
  me: () => api.get<MeResponse>("/users/me").then((r) => r.data),

  list: () => api.get<User[]>("/users").then((r) => r.data),

  updateMe: (dto: Partial<{ prenom: string; nom: string; telephone: string }>) =>
    api.patch("/users/me", dto).then((r) => r.data),

  // Photo de profil — upload multipart (champ « photo »).
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append("photo", file);
    return api
      .patch<{ photo_file_path: string; photo_url: string }>("/users/me/photo", fd)
      .then((r) => r.data);
  },

  activate: (id: string) =>
    api.patch(`/users/${id}/activate`).then((r) => r.data),

  deactivate: (id: string) =>
    api.patch(`/users/${id}/deactivate`).then((r) => r.data),

  createStaff: (dto: {
    prenom: string;
    nom: string;
    email: string;
    telephone?: string;
    profil_code: string;
    cite_id?: string;
  }) => api.post("/users/staff", dto).then((r) => r.data),
};
