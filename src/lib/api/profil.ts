import { api } from "./axios";

export interface ProfilFeatureRow {
  id: number;
  code: string;
  libelle: string | null;
  module?: string;
}

export interface ProfilModule {
  module: string;
  features: (ProfilFeatureRow & { active: boolean })[];
}

export interface ProfilFeatures {
  id: number;
  code: string;
  libelle: string | null;
  modules: ProfilModule[];
}

export const profilApi = {
  features: () =>
    api.get<ProfilFeatures[]>("/profils/features").then((r) => r.data),

  setFeatures: (profilId: number, features: string[]) =>
    api
      .put<{ profil_id: number; version: string; features: string[] }>(
        `/profils/${profilId}/features`,
        { features },
      )
      .then((r) => r.data),
};