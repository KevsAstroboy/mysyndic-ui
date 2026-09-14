import { api } from "./axios";
import type {
  CategorieIncident,
  Incident,
  IncidentDetail,
  StatutIncident,
} from "@/types/incident.types";

export const incidentApi = {
  list: (citeId: string) =>
    api.get<Incident[]>(`/incidents?cite_id=${citeId}`).then((r) => r.data),

  get: (id: string) =>
    api.get<IncidentDetail>(`/incidents/${id}`).then((r) => r.data),

  categories: () =>
    api.get<CategorieIncident[]>("/incidents/categories").then((r) => r.data),

  statuts: () =>
    api.get<StatutIncident[]>("/incidents/statuts").then((r) => r.data),

  create: (dto: {
    categorie_id?: number;
    titre?: string;
    description: string;
    photo?: File | null;
  }) => {
    const fd = new FormData();
    if (dto.categorie_id) fd.append("categorie_id", String(dto.categorie_id));
    if (dto.titre) fd.append("titre", dto.titre);
    fd.append("description", dto.description);
    if (dto.photo) fd.append("photo", dto.photo);
    return api.post<Incident>("/incidents", fd).then((r) => r.data);
  },

  like: (id: string) => api.post(`/incidents/${id}/like`).then((r) => r.data),
  unlike: (id: string) =>
    api.delete(`/incidents/${id}/like`).then((r) => r.data),

  commenter: (id: string, texte: string) =>
    api.post(`/incidents/${id}/commentaires`, { texte }).then((r) => r.data),

  repondre: (id: string, commentId: string, texte: string) =>
    api
      .post(`/incidents/${id}/commentaires/${commentId}/repondre`, { texte })
      .then((r) => r.data),

  prendreEnCharge: (id: string, note_syndic?: string) =>
    api
      .patch<Incident>(`/incidents/${id}/prise-en-charge`, { note_syndic })
      .then((r) => r.data),

  resoudre: (id: string, resolution_note: string) =>
    api
      .patch<Incident>(`/incidents/${id}/resoudre`, { resolution_note })
      .then((r) => r.data),

  noteSyndic: (id: string, note_syndic: string) =>
    api
      .patch<Incident>(`/incidents/${id}/note`, { note_syndic })
      .then((r) => r.data),
};
