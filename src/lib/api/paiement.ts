import { api } from "./axios";
import type {
  Paiement,
  PaystackInitResponse,
} from "@/types/paiement.types";
import type { PaginatedResponse } from "@/types/api.types";

export interface InitPaystackDto {
  villa_id: string;
  mois: string;
}

export const paiementApi = {
  historiqueVilla: (villaId: string) =>
    api.get<Paiement[]>(`/paiements/villa/${villaId}`).then((r) => r.data),

  initPaystack: (dto: InitPaystackDto) =>
    api.post<PaystackInitResponse>("/paiements/paystack/init", dto).then((r) => r.data),

  getById: (id: string) =>
    api.get<Paiement>(`/paiements/${id}`).then((r) => r.data),

  recu: (id: string) =>
    api
      .get<{ url?: string; preview_url?: string; file_path?: string; via?: string }>(
        `/paiements/${id}/recu`,
      )
      .then((r) => r.data),

  getByCriteria: (params: Record<string, string | number | undefined>) =>
    api
      .get<PaginatedResponse<Paiement>>("/paiements/get-by-criteria", { params })
      .then((r) => r.data),

  impayes: () => api.get("/paiements/impayes").then((r) => r.data),

  recouvrement: () => api.get("/paiements/recouvrement").then((r) => r.data),

  manuel: (dto: {
    villa_id: string;
    mois: string[];
    montant: number;
    canal: string;
    reference_externe?: string;
    note?: string;
    preuve?: File | null;
  }) => {
    const fd = new FormData();
    fd.append("villa_id", dto.villa_id);
    dto.mois.forEach((m) => fd.append("mois", m));
    fd.append("montant", String(dto.montant));
    fd.append("canal", dto.canal);
    if (dto.reference_externe) fd.append("reference_externe", dto.reference_externe);
    if (dto.note) fd.append("note", dto.note);
    if (dto.preuve) fd.append("preuve", dto.preuve);
    return api.post("/paiements/manuel", fd).then((r) => r.data);
  },

  exportExcel: () =>
    api
      .get("/paiements/export", { responseType: "blob" })
      .then((r) => r.data as Blob),
};
