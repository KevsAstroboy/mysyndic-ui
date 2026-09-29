"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { conflitApi } from "@/lib/api/conflit";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { villaApi } from "@/lib/api/villa";
import { apiErrorMessage } from "@/lib/utils/apiError";

export function ConflitForm({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [categorieId, setCategorieId] = useState("");
  const [villaCiblee, setVillaCiblee] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categories = useQuery({
    queryKey: QUERY_KEYS.categoriesConflit(),
    queryFn: conflitApi.categories,
    enabled: open,
  });

  const villas = useQuery({
    queryKey: ["villas", "all"],
    queryFn: villaApi.list,
    enabled: open,
    staleTime: 1000 * 60 * 5,
  });

  const create = useMutation({
    mutationFn: () =>
      conflitApi.create({
        categorie_id: Number(categorieId) || undefined,
        villa_ciblee_num: villaCiblee,
        description,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.conflits() });
      setCategorieId("");
      setVillaCiblee("");
      setDescription("");
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Déclaration impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Déclarer un conflit">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Type de conflit"
            placeholder="Sélectionnez un type"
            value={categorieId}
            onChange={setCategorieId}
            options={(categories.data ?? []).map((c) => ({
              value: String(c.id),
              label: c.libelle ?? c.code,
            }))}
          />

          <Select
            label="Villa concernée"
            id="conflit-villa"
            value={villaCiblee}
            onChange={setVillaCiblee}
            placeholder="Rechercher une villa…"
            options={(villas.data ?? []).map((v) => ({
              value: v.numero,
              label: `Villa ${v.numero}${v.rue ? ` · ${v.rue}` : ""}`,
            }))}
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className="text-xs font-bold tracking-[.02em] text-ink-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez la situation…"
            className="h-24 w-full resize-none rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-accent"
          />
        </div>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          onClick={() => create.mutate()}
          disabled={!description.trim() || !villaCiblee.trim()}
        >
          Déclarer le conflit
        </Button>
      </div>
    </BottomSheet>
  );
}
