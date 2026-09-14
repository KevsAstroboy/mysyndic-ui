import { api } from "./axios";
import type { PublicCite, PublicVilla, Villa } from "@/types/villa.types";

export interface CandidatureVilla {
  user_villa_id: string;
  villa: { id: string; numero: string; rue?: string };
  user: {
    id: string;
    prenom: string;
    nom: string;
    email?: string;
    telephone?: string;
  };
  created_at?: string;
}

export interface CandidatureColocataire {
  id: string;
  user: {
    id: string;
    prenom: string;
    nom: string;
    email?: string;
    telephone?: string;
  };
  created_at?: string;
}

/** Ma propre candidature en attente (toutes cités). */
export interface MesCandidature {
  id: string;
  cite: { id: string; nom: string; ville?: string; pays?: string } | null;
  villa: { id: string; numero: string; rue?: string };
  created_at?: string;
}

export const villaApi = {
  list: () => api.get<Villa[]>("/villas").then((r) => r.data),

  mesCandidatures: () =>
    api.get<MesCandidature[]>("/villas/mes-candidatures").then((r) => r.data),

  // ── Découverte publique (self-service « rejoindre une cité ») ──
  publicCites: () =>
    api.get<PublicCite[]>("/public/cites").then((r) => r.data),

  publicVillas: (citeId: string) =>
    api.get<PublicVilla[]>(`/public/cites/${citeId}/villas`).then((r) => r.data),

  /** Candidater à une villa — validée par les occupants ou le syndic. */
  candidater: (villaId: string) =>
    api
      .post<{ user_villa_id: string; occupation_en_attente: boolean }>(
        "/villas/candidatures",
        { villa_id: villaId },
      )
      .then((r) => r.data),

  candidatures: () =>
    api.get<CandidatureVilla[]>("/villas/candidatures").then((r) => r.data),

  confirmerCandidature: (userVillaId: string) =>
    api
      .post(`/villas/candidatures/${userVillaId}/confirmer`)
      .then((r) => r.data),

  refuserCandidature: (userVillaId: string) =>
    api
      .post(`/villas/candidatures/${userVillaId}/refuser`)
      .then((r) => r.data),

  candidaturesVilla: (villaId: string) =>
    api
      .get<CandidatureColocataire[]>(`/villas/${villaId}/candidatures`)
      .then((r) => r.data),

  validerColocataire: (villaId: string, userVillaId: string) =>
    api
      .post(`/villas/${villaId}/candidatures/${userVillaId}/valider`)
      .then((r) => r.data),

  refuserColocataire: (villaId: string, userVillaId: string) =>
    api
      .post(`/villas/${villaId}/candidatures/${userVillaId}/refuser`)
      .then((r) => r.data),
};
