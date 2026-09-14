import { api } from "./axios";
import type { Conversation, Message, MessageContact } from "@/types/message.types";

export const messageApi = {
  conversations: () =>
    api.get<Conversation[]>("/messages/conversations").then((r) => r.data),

  contacts: () =>
    api.get<MessageContact[]>("/messages/contacts").then((r) => r.data),

  thread: (threadId: string) =>
    api.get<Message[]>(`/messages/conversations/${threadId}`).then((r) => r.data),

  sendPrivate: (destinataire_id: string, contenu: string) =>
    api.post<Message>("/messages/private", { destinataire_id, contenu }).then((r) => r.data),

  sendGroupe: (contenu: string) =>
    api.post<Message>("/messages/groupe", { contenu }).then((r) => r.data),

  markRead: (messageId: string) =>
    api.patch(`/messages/${messageId}/lu`).then((r) => r.data),

  remove: (messageId: string) =>
    api.delete(`/messages/${messageId}`).then((r) => r.data),
};
