export interface Notification {
  id: string;
  cite_id?: string;
  type_id?: number | null;
  titre: string;
  message?: string;
  lu?: boolean;
  lu_at?: string;
  data?: unknown;
  created_at?: string;
}
