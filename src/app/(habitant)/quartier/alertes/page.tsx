"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Activity,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  MapPin,
  ShieldAlert,
  Siren,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { API_BASE } from "@/lib/api/axios";
import { alerteApi } from "@/lib/api/alerte";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import { renderMessageContent } from "@/lib/utils/messageContent";
import type { Alerte } from "@/types/alerte.types";

const PAGE_SIZE = 10;

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
  MEDICAL: "bg-[#EAF4FD] text-[#2196F3]",
  MALAISE_MEDICAL: "bg-[#EAF4FD] text-[#2196F3]",
  INCENDIE: "bg-gold-soft text-gold",
  AUTRE: "bg-surface-2 text-ink-3",
  AUTRE_URGENCE: "bg-surface-2 text-ink-3",
};

export default function MesAlertesPage() {
  const [page, setPage] = useState(1);
  const [photoAlerte, setPhotoAlerte] = useState<Alerte | null>(null);

  // Requête "toutes pages" : on charge en continu pour le suivi en temps réel.
  const all = useQuery({
    queryKey: QUERY_KEYS.mesAlertes(1, 1000),
    queryFn: () => alerteApi.mesAlertes({ page: 1, size: 1000 }),
  });

  const list = all.data?.items ?? [];
  const total = all.data?.total ?? list.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageItems = list.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-4 px-4 md:px-0">
      <p className="text-[13px] font-medium text-ink-3">
        Retrouvez ici toutes vos alertes de sécurité et leur avancement en temps réel.
      </p>

      {all.isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-md" />
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          tone="teal"
          title="Aucune alerte"
          subtitle="Lorsque vous signalerez une urgence via le bouton rouge, elle apparaîtra ici avec son suivi."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pageItems.map((a) => (
            <AlerteCard key={a.id} alerte={a} onPhoto={(al) => setPhotoAlerte(al)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink-3">
            {total} alerte{total > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-ink-3 shadow-card disabled:opacity-40"
              aria-label="Précédent"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <span className="text-[13px] font-semibold text-ink-2">
              {safePage} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={safePage >= pages}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-ink-3 shadow-card disabled:opacity-40"
              aria-label="Suivant"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Visionneuse photo (cliquable, ergonomique) */}
      <Modal open={!!photoAlerte} onClose={() => setPhotoAlerte(null)} title="Photo de l'alerte">
        {photoAlerte && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${API_BASE}/api/alertes/${photoAlerte.id}/photo`}
            alt="Photo de l'alerte"
            className="max-h-[70vh] w-full rounded-md object-contain bg-surface-2"
          />
        )}
      </Modal>
    </div>
  );
}

/** Stepper de suivi d'alerte — étapes du circuit sécurité. */
const STEP_LABELS = ["Reçue", "Agent en route", "Sur place", "Résolue"];
const STEP_CODES = ["RECUE", "AGENT_EN_ROUTE", "AGENT_SUR_PLACE", "RESOLUE"];

function stepIndexOf(a: Alerte): number {
  const code = a.statut_alerte?.code ?? "";
  const idx = STEP_CODES.indexOf(code);
  if (idx >= 0) return idx;
  // Statut inconnu / absent → stade initial "Reçue".
  return 0;
}

function AlerteCard({
  alerte: a,
  onPhoto,
}: {
  alerte: Alerte;
  onPhoto?: (a: Alerte) => void;
}) {
  const Icon = MOTIF_ICONS[a.motif_alerte?.code ?? ""] ?? AlertTriangle;
  const tone = MOTIF_TONES[a.motif_alerte?.code ?? ""] ?? "bg-danger-soft text-danger";
  const step = stepIndexOf(a);
  const resolved = a.statut_alerte?.code === "RESOLUE";

  return (
    <div className="rounded-md bg-surface p-4 shadow-card">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              a.escalade ? "bg-danger-soft text-danger" : tone,
            )}
          >
            {a.escalade ? (
              <Siren size={18} strokeWidth={1.7} />
            ) : (
              <Icon size={18} strokeWidth={1.7} />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold text-ink">
              {a.motif_alerte?.libelle ?? "Alerte"}
              {a.escalade && (
                <span className="ml-2 rounded-pill bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                  Escaladée
                </span>
              )}
            </div>
            <div className="mt-0.5 whitespace-pre-wrap break-words text-[12px] font-medium leading-relaxed text-ink-2">
              {a.description
                ? renderMessageContent(a.description)
                : "Alerte signalée"}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-ink-3">
              {a.cite?.nom && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} strokeWidth={2} />
                  {a.cite.nom}
                </span>
              )}
              {a.villa && (
                <span className="flex items-center gap-1">
                  Villa {a.villa.numero}
                  {a.villa.rue ? `, ${a.villa.rue}` : ""}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={12} strokeWidth={2} />
                {formatRelative(a.created_at ?? "")}
              </span>
            </div>
          </div>
        </div>
        <Chip variant={resolved ? "green" : a.escalade ? "red" : "teal"} className="shrink-0">
          {a.statut_alerte?.libelle ?? "Reçue"}
        </Chip>
      </div>

      {a.photo_file_path && (
        <button
          type="button"
          onClick={() => onPhoto?.(a)}
          className="relative mt-3 block w-full overflow-hidden rounded-md"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${API_BASE}/api/alertes/${a.id}/photo`}
            alt="Photo de l'alerte"
            className="h-36 w-full object-cover"
          />
        </button>
      )}

      {/* Suivi — stepper compact (colonnes égales, aucun scroll horizontal) */}
      <div className="mt-3 flex items-start">
        {STEP_LABELS.map((label, i) => {
          const done = i < step || (i === step && resolved);
          const active = i === step && !resolved;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-pill",
                    i === 0
                      ? "bg-transparent"
                      : i <= step
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                    done
                      ? "bg-primary text-white"
                      : active
                        ? "bg-primary-light text-primary"
                        : "bg-surface-2 text-ink-3",
                  )}
                >
                  {done ? <CheckCircle2 size={13} strokeWidth={2} /> : String(i + 1)}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-pill",
                    i === STEP_LABELS.length - 1
                      ? "bg-transparent"
                      : i < step
                        ? "bg-primary"
                        : "bg-border",
                  )}
                />
              </div>
              <span
                className={cn(
                  "w-full text-center text-[9px] font-bold leading-[1.15]",
                  active ? "text-primary" : done ? "text-ink-2" : "text-ink-3",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}