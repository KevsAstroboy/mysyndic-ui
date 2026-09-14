"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  CircleAlert,
  Check,
  Droplets,
  ShieldAlert,
  Trash2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { incidentApi } from "@/lib/api/incident";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

const CATEGORY_STYLE: Record<string, { Icon: LucideIcon; cls: string }> = {
  ELECTRICITE: { Icon: Zap, cls: "bg-gold-soft text-gold" },
  EAU: { Icon: Droplets, cls: "bg-[#EAF4FD] text-[#2196F3]" },
  STATIONNEMENT: { Icon: Car, cls: "bg-[#EDE8FD] text-[#7C3AED]" },
  PROPRETE: { Icon: Trash2, cls: "bg-emerald-soft text-emerald" },
  SECURITE: { Icon: ShieldAlert, cls: "bg-danger-soft text-danger" },
  AUTRE: { Icon: CircleAlert, cls: "bg-surface-2 text-ink-3" },
};

export function IncidentForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { citeId } = useAuth();
  const qc = useQueryClient();
  const [categorieId, setCategorieId] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = useQuery({
    queryKey: QUERY_KEYS.categoriesIncident(),
    queryFn: incidentApi.categories,
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () =>
      incidentApi.create({
        categorie_id: Number(categorieId) || undefined,
        titre: titre.trim() || undefined,
        description,
        photo,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.incidents(citeId ?? "") });
      setCategorieId("");
      setTitre("");
      setDescription("");
      setPhoto(null);
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Signalement impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Signaler un incident">
      <div className="flex flex-col gap-4">
        <p className="-mt-1 text-[13px] font-medium text-ink-3">
          Choisissez la catégorie
        </p>

        {/* Grille des catégories */}
        {categories.isLoading && (categories.data ?? []).length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 rounded-md border-2 border-border px-2 py-3"
              >
                <span className="h-9 w-9 animate-pulse rounded-sm bg-border" />
                <span className="h-2 w-12 animate-pulse rounded-sm bg-border" />
              </div>
            ))}
          </div>
        ) : categories.error && (categories.data ?? []).length === 0 ? (
          <p className="rounded-md bg-danger-soft px-3 py-2.5 text-xs font-semibold text-danger">
            {apiErrorMessage(categories.error, "Catégories indisponibles")}
          </p>
        ) : (
        <div className="grid grid-cols-3 gap-2">
          {(categories.data ?? []).map((c) => {
            const meta = CATEGORY_STYLE[c.code] ?? CATEGORY_STYLE.AUTRE;
            const Icon = meta.Icon;
            const active = String(c.id) === categorieId;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategorieId(String(c.id))}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-md border-2 px-2 py-3 transition-colors",
                  active
                    ? "border-gold bg-gold-soft font-extrabold shadow-[0_0_0_2px_var(--gold-soft)] outline-none ring-2 ring-gold/25"
                    : "border-border bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-sm bg-surface",
                    meta.cls,
                  )}
                >
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <span
                  className={cn(
                    "text-center text-[10px] font-bold leading-[1.2]",
                    active ? "text-gold" : "text-ink-3",
                  )}
                >
                  {c.libelle ?? c.code}
                </span>
                {active && (
                  <span className="absolute right-0.5 top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-white">
                    <Check size={10} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        )}

        <Input title={titre} onChange={setTitre} />

        <div className="flex flex-col gap-[6px]">
          <label className="text-xs font-bold tracking-[.02em] text-ink-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'incident…"
            className="h-24 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
          />
        </div>

        {/* Photo */}
        <PhotoUpload value={photo} onChange={setPhoto} />

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          onClick={() => create.mutate()}
          disabled={!description.trim()}
          className="rounded-md py-4 text-[15px]"
        >
          Envoyer le signalement
        </Button>
        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-semibold text-ink-3"
        >
          Annuler
        </button>
      </div>
    </BottomSheet>
  );
}

function Input({
  title,
  onChange,
}: {
  title: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-xs font-bold tracking-[.02em] text-ink-2">
        Titre (optionnel)
      </label>
      <input
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex : Panne éclairage allée B"
        className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
      />
    </div>
  );
}
