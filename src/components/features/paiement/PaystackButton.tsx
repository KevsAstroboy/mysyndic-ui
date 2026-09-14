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
  mois: string;
  montant: number;
  disabled?: boolean;
}) {
  const init = useMutation({
    mutationFn: () => paiementApi.initPaystack({ villa_id: villaId, mois }),
    onSuccess: (data) => {
      if (data.authorization_url) window.location.href = data.authorization_url;
    },
  });

  return (
    <div>
      <Button
        fullWidth
        size="lg"
        loading={init.isPending}
        disabled={disabled}
        onClick={() => init.mutate()}
        className="rounded-md py-4 text-[15px] tracking-[-.1px] shadow-[0_4px_16px_rgba(13,110,90,.3)]"
      >
        Payer {formatMonth(mois)} — {formatFCFA(montant)} FCFA
      </Button>
      {init.isError && (
        <p className="mt-2 text-center text-xs font-semibold text-danger">
          {apiErrorMessage(init.error, "Paiement impossible")}
        </p>
      )}
    </div>
  );
}
