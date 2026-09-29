"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { paiementApi } from "@/lib/api/paiement";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth } from "@/lib/utils/formatDate";

export function PaystackButton({
  villaId,
  mois,
  montant,
  disabled,
}: {
  villaId: string;
  /** Mois sélectionnés (YYYY-MM) — un seul ou plusieurs. */
  mois: string[];
  /** Montant total de la sélection. */
  montant: number;
  disabled?: boolean;
}) {
  const init = useMutation({
    mutationFn: () => paiementApi.initPaystack({ villa_id: villaId, mois }),
    onSuccess: (data) => {
      if (data.authorization_url) window.location.href = data.authorization_url;
    },
  });

  const label =
    mois.length === 0
      ? ""
      : mois.length === 1
        ? formatMonth(mois[0])
        : `${mois.length} mois · ${formatMonth(mois[0])} → ${formatMonth(mois[mois.length - 1])}`;

  return (
    <div>
      <Button
        fullWidth
        size="lg"
        loading={init.isPending}
        disabled={disabled || mois.length === 0}
        onClick={() => init.mutate()}
        className="rounded-md py-4 text-[15px] tracking-[-.1px] shadow-[0_4px_16px_rgba(13,110,90,.3)]"
      >
        {init.isPending
          ? "Redirection Paystack…"
          : `Payer ${formatFCFA(montant)} FCFA`}
      </Button>
      {mois.length > 0 && (
        <p className="mt-2 text-center text-[11px] font-semibold text-ink-3">
          {label}
        </p>
      )}
      {init.isError && (
        <p className="mt-2 text-center text-xs font-semibold text-danger">
          {apiErrorMessage(init.error, "Paiement impossible")}
        </p>
      )}
    </div>
  );
}