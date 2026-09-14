import { api } from "./axios";
import type { Cite } from "@/types/cite.types";

export const citeApi = {
  list: (filter?: { mois?: string; debut?: string; fin?: string }) =>
    api
      .get<Cite[]>("/cites", { params: filter })
      .then((r) => r.data),

  create: (dto: { nom: string; ville?: string; pays?: string }) =>
    api.post<Cite>("/cites", dto).then((r) => r.data),

  update: (id: string, dto: { nom?: string; ville?: string; pays?: string; is_active?: boolean }) =>
    api.patch<Cite>(`/cites/${id}`, dto).then((r) => r.data),

  addVilla: (citeId: string, dto: { numero: string; rue?: string; description?: string }) =>
    api.post(`/cites/${citeId}/villas`, dto).then((r) => r.data),
};
