import { api } from "./axios";
import type { Alerte, MotifAlerte, StatutAlerte } from "@/types/alerte.types";

export interface MesAlertesResponse {
  items: Alerte[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const alerteApi = {
  motifs: () => api.get<MotifAlerte[]>("/alertes/motifs").then((r) => r.data),

  statuts: () => api.get<StatutAlerte[]>("/alertes/statuts").then((r) => r.data),

  actives: () => api.get<Alerte[]>("/alertes/actives").then((r) => r.data),

  historique: () => api.get<Alerte[]>("/alertes/historique").then((r) => r.data),

  /** Mes alertes déclarées, paginées (suivi habitant). */
  mesAlertes: (params: { page?: number; size?: number } = {}) =>
    api
      .get<MesAlertesResponse>("/alertes/mes-alertes", { params })
      .then((r) => r.data),

  /** Toutes les alertes de la cité (syndic / staff), paginées. */
  citeAlertes: (params: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}) =>
    api
      .get<MesAlertesResponse>("/alertes/get-by-criteria", { params })
      .then((r) => r.data),

  create: (dto: {
    villa_id?: string;
    motif_id?: number;
    description?: string;
    photo_file_path?: string;
    photo?: File | null;
    silencieuse?: boolean;
  }) => {
    const fd = new FormData();
    if (dto.villa_id) fd.append("villa_id", dto.villa_id);
    if (dto.motif_id) fd.append("motif_id", String(dto.motif_id));
    if (dto.description) fd.append("description", dto.description);
    if (dto.photo) fd.append("photo", dto.photo);
    if (dto.silencieuse) fd.append("silencieuse", "true");
    return api.post("/alertes", fd).then((r) => r.data);
  },

  updateStatut: (id: string, dto: { statut_id: number; escalade?: boolean }) =>
    api.patch<Alerte>(`/alertes/${id}/statut`, dto).then((r) => r.data),

  resoudre: (id: string, dto?: { description?: string }) =>
    api.patch<Alerte>(`/alertes/${id}/resoudre`, dto ?? {}).then((r) => r.data),
};
