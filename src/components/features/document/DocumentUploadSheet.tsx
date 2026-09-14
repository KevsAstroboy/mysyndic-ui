"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, X } from "lucide-react";
import { useRef, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { documentApi } from "@/lib/api/document";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

export function DocumentUploadSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { citeId } = useAuth();
  const qc = useQueryClient();
  const [titre, setTitre] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: () => documentApi.upload({ titre: titre.trim(), file: file! }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.documents(citeId ?? "") });
      setTitre("");
      setFile(null);
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Envoi impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Déposer un document">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-[6px]">
          <label className="text-xs font-bold tracking-[.02em] text-ink-2">
            Titre
          </label>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex : Règlement intérieur 2026"
            className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex items-center gap-3 rounded-md border-[1.5px] border-dashed px-3 py-4 text-left",
            file ? "border-primary bg-primary-light" : "border-border bg-surface-2",
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-light text-primary">
            <FileUp size={18} strokeWidth={1.7} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold text-ink">
              {file ? file.name : "Choisir un fichier"}
            </span>
            <span className="text-[11px] font-medium text-ink-3">
              {file
                ? `${Math.round(file.size / 1024)} Ko`
                : "PDF, Word, Excel, image…"}
            </span>
          </span>
          {file && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-ink-3"
            >
              <X size={15} strokeWidth={2} />
            </span>
          )}
        </button>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={upload.isPending}
          onClick={() => upload.mutate()}
          disabled={!titre.trim() || !file}
          className="rounded-md py-4 text-[15px]"
        >
          Envoyer le document
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
