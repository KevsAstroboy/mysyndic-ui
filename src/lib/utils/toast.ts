"use client";

export type ToastTone = "info" | "success" | "error";

export interface ToastInput {
  titre: string;
  message?: string;
  tone?: ToastTone;
}

/** Événement window écouté par `ToastHost`. */
export const TOAST_EVENT = "mysyndic:toast";

/** Affiche un toast transitoire (erreur/succès d'action). */
export function toast(input: ToastInput) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastInput>(TOAST_EVENT, { detail: input }));
}
