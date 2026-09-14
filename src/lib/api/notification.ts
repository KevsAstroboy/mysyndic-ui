import { api } from "./axios";
import type { Notification } from "@/types/notification.types";

export const notificationApi = {
  list: () => api.get<Notification[]>("/notifications").then((r) => r.data),

  badge: () => api.get<{ count: number }>("/notifications/badge").then((r) => r.data),

  markRead: (id: string) => api.patch(`/notifications/${id}/lu`).then((r) => r.data),

  readAll: () => api.patch("/notifications/read-all").then((r) => r.data),
};
