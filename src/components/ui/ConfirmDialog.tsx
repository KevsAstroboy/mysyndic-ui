"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  confirmLabel = "Supprimer",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle size={20} strokeWidth={1.7} />
          </span>
          <p className="text-sm font-medium leading-relaxed text-ink-2">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md bg-surface-2 py-3 text-sm font-bold text-ink-2"
          >
            Annuler
          </button>
          <Button
            variant="danger"
            loading={loading}
            onClick={onConfirm}
            className="flex-1 rounded-md py-3 text-sm font-bold"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
