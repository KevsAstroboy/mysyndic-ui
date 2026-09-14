export interface PaiementStatut {
  id: number;
  libelle?: string;
  code: string;
}

export interface CanalPaiement {
  id: number;
  libelle?: string;
  code: string;
  is_manuel?: boolean;
}

export interface Paiement {
  id?: string;
  cite_id?: string;
  villa_id?: string;
  saisi_par?: string;
  mois: string;
  montant: number;
  statut_id?: number;
  canal_id?: number;
  reference_paystack?: string;
  reference_externe?: string;
  preuve_file_path?: string;
  note?: string;
  created_at?: string;
  statut_paiement?: PaiementStatut;
  canal_paiement?: CanalPaiement;
  villa?: { id: string; numero: string; rue?: string };
}

export interface PaystackInitResponse {
  authorization_url?: string;
  reference?: string;
  access_code?: string;
}

export interface PaiementMois {
  mois: string;
  statut: "CONFIRME" | "EN_ATTENTE" | "ECHOUE" | "IMPAYE";
}
