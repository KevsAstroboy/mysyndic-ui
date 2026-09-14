import { api } from "./axios";
import type {
  CommentsPage,
  FeedComment,
  FeedPage,
  FeedPost,
  LikeResult,
  MediaMeta,
} from "@/types/feed.types";

export interface CreateFeedInput {
  contenu?: string;
  files: File[];
  meta: MediaMeta[];
}

export const feedApi = {
  list: (params: { cursor?: string; limit?: number } = {}) =>
    api.get<FeedPage>("/feed", { params }).then((r) => r.data),

  get: (id: string) => api.get<FeedPost>(`/feed/${id}`).then((r) => r.data),

  create: (
    input: CreateFeedInput,
    onUploadProgress?: (percent: number) => void,
  ) => {
    const fd = new FormData();
    if (input.contenu?.trim()) fd.append("contenu", input.contenu.trim());
    if (input.meta.length) fd.append("media_meta", JSON.stringify(input.meta));
    for (const file of input.files) fd.append("media", file);
    return api
      .post<FeedPost>("/feed", fd, {
        onUploadProgress: (e) => {
          if (!onUploadProgress || !e.total) return;
          onUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      })
      .then((r) => r.data);
  },

  remove: (id: string) =>
    api.delete<{ id: string; deleted: boolean }>(`/feed/${id}`).then((r) => r.data),

  like: (id: string) =>
    api.post<LikeResult>(`/feed/${id}/like`).then((r) => r.data),

  unlike: (id: string) =>
    api.delete<LikeResult>(`/feed/${id}/like`).then((r) => r.data),

  comments: (id: string, params: { cursor?: string; limit?: number } = {}) =>
    api
      .get<CommentsPage>(`/feed/${id}/commentaires`, { params })
      .then((r) => r.data),

  addComment: (id: string, texte: string) =>
    api
      .post<FeedComment>(`/feed/${id}/commentaires`, { texte })
      .then((r) => r.data),

  reply: (id: string, commentId: string, texte: string) =>
    api
      .post<FeedComment>(
        `/feed/${id}/commentaires/${commentId}/repondre`,
        { texte },
      )
      .then((r) => r.data),
};
