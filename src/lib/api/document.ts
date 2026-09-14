import { api } from "./axios";
import type { Document, TypeDocument } from "@/types/document.types";

export const documentApi = {
  list: (citeId: string) =>
    api.get<Document[]>(`/documents?cite_id=${citeId}`).then((r) => r.data),

  types: () => api.get<TypeDocument[]>("/documents/types").then((r) => r.data),

  download: (id: string) =>
    api.get<{ url?: string }>(`/documents/${id}/download`).then((r) => r.data),

  upload: (dto: { titre: string; file: File }) => {
    const fd = new FormData();
    fd.append("titre", dto.titre);
    fd.append("file", dto.file);
    return api.post<Document>("/documents", fd).then((r) => r.data);
  },

  remove: (id: string) => api.delete(`/documents/${id}`).then((r) => r.data),
};
