import { api } from "./axios";
import type { Annonce, CategorieAnnonce } from "@/types/annonce.types";

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const annonceApi = {
  list: (citeId: string) =>
    api.get<Annonce[]>(`/annonces?cite_id=${citeId}`).then((r) => r.data),

  /** Annonces de la cité, paginées côté serveur. */
  pages: (params: { page?: number; size?: number; sort?: string } = {}) =>
    api
      .get<PageResponse<Annonce>>("/annonces/get-by-criteria", { params })
      .then((r) => r.data),

  categories: () =>
    api.get<CategorieAnnonce[]>("/annonces/categories").then((r) => r.data),

  create: (dto: {
    categorie_id?: number;
    titre: string;
    contenu: string;
    est_epinglee?: boolean;
  }) => api.post<Annonce>("/annonces", dto).then((r) => r.data),

  remove: (id: string) => api.delete(`/annonces/${id}`).then((r) => r.data),
};
