import { AxiosError } from "axios";

/** Extrait un message d'erreur lisible d'une erreur Axios. */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const err = e as AxiosError<{
    message?: string | string[] | { message?: string };
  }>;
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === "string") return msg.length > 0 ? msg : fallback;
  if (msg && typeof msg === "object" && typeof msg.message === "string")
    return msg.message;
  return fallback;
}
