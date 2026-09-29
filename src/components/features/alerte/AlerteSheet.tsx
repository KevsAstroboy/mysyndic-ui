"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  Flame,
  Info,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { alerteApi } from "@/lib/api/alerte";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useCurrentVilla } from "@/lib/hooks/useCurrentVilla";
import type { MotifAlerte } from "@/types/alerte.types";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

const MOTIF_ICONS: Record<string, LucideIcon> = {
  INTRUSION: AlertTriangle,
  INTRUSION_AGRESSION: AlertTriangle,
  MEDICAL: Activity,
  MALAISE_MEDICAL: Activity,
  INCENDIE: Flame,
  AUTRE: Info,
  AUTRE_URGENCE: Info,
};

const MOTIF_TONES: Record<string, string> = {
  INTRUSION: "bg-danger-soft text-danger",
  INTRUSION_AGRESSION: "bg-danger-soft text-danger",
  MEDICAL: "bg-info-soft text-info",
  MALAISE_MEDICAL: "bg-info-soft text-info",
  INCENDIE: "bg-gold-soft text-gold",
  AUTRE: "bg-surface-2 text-ink-3",
  AUTRE_URGENCE: "bg-surface-2 text-ink-3",
};

export function AlerteSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const me = useCurrentVilla();
  const qc = useQueryClient();
  const [motifId, setMotifId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  const motifs = useQuery({
    queryKey: QUERY_KEYS.motifsAlerte(),
    queryFn: alerteApi.motifs,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setMotifId(null);
      setDescription("");
      setPhoto(null);
      setError(null);
      setSentId(null);
    }
  }, [open]);

  const send = useMutation({
    mutationFn: () =>
      alerteApi.create({
        // La villa de l'émetteur (visible côté syndic/sécurité : n° + rue).
        villa_id: me.data?.villa?.id ?? undefined,
        motif_id: motifId ?? undefined,
        description: description.trim() || undefined,
        photo,
      }),
    onSuccess: (data) => {
      setSentId(data?.id ?? "sent");
      // Rafraîchit immédiatement le suivi (« mes alertes ») : à l'arrivée sur
      // la page, la nouvelle alerte est bien là sans attendre un polling.
      qc.invalidateQueries({ queryKey: ["alertes", "mes-alertes"] });
    },
    onError: (e) => setError(apiErrorMessage(e, "Envoi impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Signaler une urgence">
      {sentId ? (
        <div className="flex flex-col items-center px-2 py-8 text-center">
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-emerald-soft text-emerald"
          >
            <CheckCircle2 size={40} strokeWidth={1.7} />
          </motion.span>
          <h3 className="mt-4 text-lg font-extrabold tracking-[-.3px] text-ink">
            Alerte envoyée !
          </h3>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink-3">
            Les agents de sécurité ont été notifiés.
            <br />
            Suivez votre signalement en temps réel.
          </p>
          <Button
            fullWidth
            size="lg"
            className="mt-6 rounded-md py-4 text-[15px]"
            onClick={() => {
              onClose();
              router.push("/quartier/alertes");
            }}
          >
            <ShieldAlert size={18} strokeWidth={1.7} />
            Voir le suivi de mon alerte
          </Button>
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-md py-3.5 text-sm font-semibold text-ink-3"
          >
            Fermer
          </button>
        </div>
      ) : (
        <>
          <p className="mb-5 text-[13px] font-medium text-ink-3">
            Choisissez le type d&apos;incident
          </p>

      {motifs.isLoading && (motifs.data ?? []).length === 0 ? (
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-md border-2 border-transparent bg-surface-2 px-3 py-3.5"
            >
              <span className="h-9 w-9 animate-pulse rounded-sm bg-border" />
              <span className="h-2.5 w-16 animate-pulse rounded-sm bg-border" />
            </div>
          ))}
        </div>
      ) : motifs.error && (motifs.data ?? []).length === 0 ? (
        <p className="mb-4 rounded-md bg-danger-soft px-3 py-2.5 text-xs font-semibold text-danger">
          {apiErrorMessage(motifs.error, "Types d'incident indisponibles")}
        </p>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {(motifs.data ?? []).map((m: MotifAlerte) => {
            const Icon = MOTIF_ICONS[m.code] ?? AlertTriangle;
            const tone = MOTIF_TONES[m.code] ?? "bg-danger-soft text-danger";
            const selected = motifId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setMotifId(m.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-md border-2 px-3 py-3.5 transition-colors",
                  "border-transparent bg-surface-2",
                  selected && "border-danger bg-danger-soft shadow-[0_0_0_2px_rgb(var(--red-soft))] outline-none ring-2 ring-danger/25",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-sm",
                    tone,
                  )}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <span
                  className={cn(
                    "text-center text-[11px] font-bold leading-tight",
                    selected ? "text-danger" : "text-ink",
                  )}
                >
                  {m.libelle ?? m.code}
                </span>
                {selected && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mb-3 text-xs font-semibold text-danger">{error}</p>
      )}

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Décrivez rapidement la situation…"
        className="mb-3.5 h-20 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent"
      />

      <PhotoUpload
        value={photo}
        onChange={setPhoto}
        label="Ajouter une photo (optionnel)"
        className="mb-3.5"
      />

      <Button
        variant="danger"
        fullWidth
        size="lg"
        className="rounded-md py-4 text-[15px] tracking-[-.1px] shadow-[0_4px_16px_var(--red-glow)]"
        loading={send.isPending}
        onClick={() => send.mutate()}
      >
        {send.isPending ? "Envoi…" : "Envoyer l'alerte"}
      </Button>

      <button
        onClick={onClose}
        className="mt-2 w-full rounded-md py-3.5 text-sm font-semibold text-ink-3"
      >
        Annuler
      </button>
        </>
      )}
    </BottomSheet>
  );
}
