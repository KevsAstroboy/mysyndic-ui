"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pin } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { annonceApi } from "@/lib/api/annonce";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

export function AnnonceForm({
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
  const [contenu, setContenu] = useState("");
  const [epinglee, setEpinglee] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useQuery({
    queryKey: QUERY_KEYS.categoriesAnnonce(),
    queryFn: annonceApi.categories,
    enabled: open,
  });

  const create = useMutation({
    mutationFn: () =>
      annonceApi.create({
        categorie_id: Number(categorieId) || undefined,
        titre: titre.trim(),
        contenu: contenu.trim(),
        est_epinglee: epinglee,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.annonces(citeId ?? "") });
      setCategorieId("");
      setTitre("");
      setContenu("");
      setEpinglee(false);
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Publication impossible")),
  });

  const cats = categories.data ?? [];

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouvelle annonce">
      <div className="flex flex-col gap-4">
        <p className="-mt-1 text-[13px] font-medium text-ink-3">
          Sera visible par tous les habitants
        </p>

        {/* Catégories */}
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[.02em] text-ink-2">
            Catégorie
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => {
              const active = String(c.id) === categorieId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategorieId(String(c.id))}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-pill border-[1.5px] px-3.5 py-1.5 text-[12px] font-bold",
                    active
                      ? "border-primary-dark bg-primary-dark text-white"
                      : "border-border bg-surface-2 text-ink-3",
                  )}
                >
                  {c.libelle ?? c.code}
                </button>
              );
            })}
          </div>
        </div>

        {/* Titre */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-xs font-bold tracking-[.02em] text-ink-2">
            Titre
          </label>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Réunion copropriétaires — 12 sept."
            className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] font-bold text-ink outline-none placeholder:font-medium placeholder:text-ink-3 focus:border-primary"
          />
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-[6px]">
          <label className="text-xs font-bold tracking-[.02em] text-ink-2">
            Contenu
          </label>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Décrivez l'annonce…"
            className="h-24 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
          />
        </div>

        {/* Épingler */}
        <button
          type="button"
          onClick={() => setEpinglee((v) => !v)}
          className={cn(
            "flex items-center justify-between rounded-md border-[1.5px] px-3.5 py-3 transition-colors",
            epinglee ? "border-primary bg-primary-light" : "border-border bg-surface-2",
          )}
        >
          <span className="flex items-center gap-2.5">
            <Pin
              size={18}
              strokeWidth={1.7}
              className={epinglee ? "text-primary" : "text-ink-3"}
            />
            <span className="text-left">
              <span
                className={cn(
                  "block text-[13px] font-bold",
                  epinglee ? "text-primary" : "text-ink",
                )}
              >
                Épingler en haut
              </span>
              <span
                className={cn(
                  "block text-[11px] font-medium",
                  epinglee ? "text-primary/70" : "text-ink-3",
                )}
              >
                Toujours visible en premier
              </span>
            </span>
          </span>
          <span
            className={cn(
              "flex h-[26px] w-11 shrink-0 items-center rounded-pill p-[3px] transition-colors",
              epinglee ? "justify-end bg-primary" : "justify-start bg-border",
            )}
          >
            <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.2)]" />
          </span>
        </button>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          onClick={() => create.mutate()}
          disabled={!titre.trim() || !contenu.trim()}
          className="rounded-md py-4 text-[15px]"
        >
          Publier l&apos;annonce
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
