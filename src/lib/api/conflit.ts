import { api } from "./axios";
import type {
  CategorieConflit,
  Conflit,
  StatutConflit,
} from "@/types/conflit.types";
import type { PageResponse } from "./annonce";

export const conflitApi = {
  mesConflits: () =>
    api.get<Conflit[]>("/conflits/mes-conflits").then((r) => r.data),

  list: () => api.get<Conflit[]>("/conflits").then((r) => r.data),

  /** Tous les conflits de la cité, paginés côté serveur (staff). */
  pages: (params: { page?: number; size?: number; sort?: string } = {}) =>
    api
      .get<PageResponse<Conflit>>("/conflits/get-by-criteria", { params })
      .then((r) => r.data),

  categories: () =>
    api.get<CategorieConflit[]>("/conflits/categories").then((r) => r.data),

  statuts: () =>
    api.get<StatutConflit[]>("/conflits/statuts").then((r) => r.data),

  create: (dto: {
    categorie_id?: number;
    villa_ciblee_num: string;
    description: string;
  }) => api.post<Conflit>("/conflits", dto).then((r) => r.data),

  prendreEnCharge: (id: string, note_syndic?: string) =>
    api
      .patch<Conflit>(`/conflits/${id}/prise-en-charge`, { note_syndic })
      .then((r) => r.data),

  resoudre: (id: string, resolution_note: string, classe_sans_suite?: boolean) =>
    api
      .patch<Conflit>(`/conflits/${id}/resoudre`, {
        resolution_note,
        classe_sans_suite,
      })
      .then((r) => r.data),

  noteSyndic: (id: string, note_syndic: string) =>
    api.patch<Conflit>(`/conflits/${id}/note`, { note_syndic }).then((r) => r.data),
};
