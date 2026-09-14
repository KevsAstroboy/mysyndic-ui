import { api } from "./axios";
import type { DashboardSummary } from "@/types/dashboard.types";

export const dashboardApi = {
  summary: (filter?: { mois?: string; debut?: string; fin?: string }) =>
    api
      .get<DashboardSummary>("/dashboard/summary", { params: filter })
      .then((r) => r.data),
};
