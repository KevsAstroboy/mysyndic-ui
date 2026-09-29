import { api } from "./axios";
import type { Cite, CiteConfiguration, SaVilla } from "@/types/cite.types";
import type { User } from "@/types/user.types";

export const citeApi = {
  list: (filter?: { mois?: string; debut?: string; fin?: string }) =>
    api
      .get<Cite[]>("/cites", { params: filter })
      .then((r) => r.data),

  create: (dto: {
    nom: string;
    ville?: string;
    pays?: string;
    nombre_villas_attendu?: number;
    paystack_subaccount_code?: string;
  }) => api.post<Cite>("/cites", dto).then((r) => r.data),

  update: (id: string, dto: { nom?: string; ville?: string; pays?: string; is_active?: boolean; nombre_villas_attendu?: number; paystack_subaccount_code?: string }) =>
    api.patch<Cite>(`/cites/${id}`, dto).then((r) => r.data),

  addVilla: (citeId: string, dto: { numero: string; rue?: string; description?: string }) =>
    api.post(`/cites/${citeId}/villas`, dto).then((r) => r.data),

  // ── Gestion super admin d'une cité ─────────────────────────
  villas: (citeId: string) =>
    api.get<SaVilla[]>(`/cites/${citeId}/villas`).then((r) => r.data),

  updateVilla: (
    citeId: string,
    villaId: string,
    dto: { numero?: string; rue?: string; description?: string; is_active?: boolean },
  ) => api.patch(`/cites/${citeId}/villas/${villaId}`, dto).then((r) => r.data),

  deleteVilla: (citeId: string, villaId: string) =>
    api.delete(`/cites/${citeId}/villas/${villaId}`).then((r) => r.data),

  users: (citeId: string, profil?: string) =>
    api
      .get<User[]>(`/cites/${citeId}/users`, { params: profil ? { profil } : undefined })
      .then((r) => r.data),

  activateUser: (citeId: string, userId: string) =>
    api.patch(`/cites/${citeId}/users/${userId}/activate`).then((r) => r.data),

  deactivateUser: (citeId: string, userId: string) =>
    api.patch(`/cites/${citeId}/users/${userId}/deactivate`).then((r) => r.data),

  configuration: (citeId: string) =>
    api.get<CiteConfiguration>(`/cites/${citeId}/configuration`).then((r) => r.data),

  updateConfiguration: (
    citeId: string,
    dto: Partial<{
      cotisation_mensuelle: number;
      lien_wave: string;
      telephone_syndic: string;
      telephone_urgence: string;
      paystack_subaccount_code: string;
      paystack_subaccount_mode: "SIMPLE" | "SPLIT";
      paystack_subaccount_split: number;
      nombre_villas_attendu: number;
    }>,
  ) => api.patch(`/cites/${citeId}/configuration`, dto).then((r) => r.data),

  // Crée le sous-compte Paystack de la cité côté Paystack puis le persiste
  // dans la configuration (le code de retour sert à l'encaissement).
  // Réglage rémunération unique : soit une commission (mode SIMPLE + %),
  // soit un split par transaction — jamais les deux.
  createSubaccount: (
    citeId: string,
    dto: {
      business_name: string;
      settlement_bank: string;
      account_number: string;
      percentage_charge: number;
      paystack_subaccount_mode?: "SIMPLE" | "SPLIT";
      paystack_subaccount_split?: number;
    },
  ) =>
    api
      .post<{
        paystack_subaccount_code?: string;
        paystack_subaccount_mode?: "SIMPLE" | "SPLIT";
        paystack_subaccount_split?: number;
      }>(
        `/cites/${citeId}/paystack/subaccount`,
        dto,
      )
      .then((r) => r.data),
};
