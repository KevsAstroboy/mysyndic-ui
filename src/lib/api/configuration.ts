import { api } from "./axios";

export interface CiteConfiguration {
  id?: string;
  cite_id?: string;
  cotisation_mensuelle?: number | null;
  lien_wave?: string | null;
  telephone_syndic?: string | null;
  telephone_urgence?: string | null;
  paystack_subaccount_code?: string | null;
  paystack_subaccount_mode?: string | null;
  paystack_subaccount_split?: number | null;
  nombre_villas_attendu?: number | null;
  modifier?: { id: string; prenom: string; nom: string } | null;
  modifier_at?: string | null;
}

export const configurationApi = {
  get: () => api.get<CiteConfiguration>("/configuration").then((r) => r.data),

  update: (dto: Partial<CiteConfiguration>) =>
    api.patch<CiteConfiguration>("/configuration", dto).then((r) => r.data),

  // Créé le sous-compte Paystack côté Paystack puis le persiste (super admin).
  createSubaccount: (dto: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge?: number;
    primary_contact_email?: string;
  }) =>
    api
      .post<{ paystack_subaccount_code: string }>(
        "/configuration/paystack/subaccount",
        dto,
      )
      .then((r) => r.data),
};
