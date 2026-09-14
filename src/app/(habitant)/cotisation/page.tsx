"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { HistoriqueList } from "@/components/features/paiement/HistoriqueList";
import { PaystackButton } from "@/components/features/paiement/PaystackButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { configurationApi } from "@/lib/api/configuration";
import { paiementApi } from "@/lib/api/paiement";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useCurrentVilla } from "@/lib/hooks/useCurrentVilla";
import { STATUT_CONFIRME, currentMonth } from "@/lib/utils/cotisation";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth } from "@/lib/utils/formatDate";

export default function CotisationPage() {
  const router = useRouter();
  const me = useCurrentVilla();
  const villa = me.data?.villa;
  const villaId = villa?.id;

  const config = useQuery({
    queryKey: ["configuration"],
    queryFn: configurationApi.get,
  });
  const paiements = useQuery({
    queryKey: QUERY_KEYS.paiements(villaId ?? ""),
    queryFn: () => paiementApi.historiqueVilla(villaId!),
    enabled: !!villaId,
  });

  const moisCourant = currentMonth();
  const montant = config.data?.cotisation_mensuelle ?? 25000;
  const list = paiements.data ?? [];
  const paid = list.filter((p) => p.statut_id === STATUT_CONFIRME);
  const totalPaid = paid.reduce((s, p) => s + p.montant, 0);
  const moisPayes = paid.length;
  const currentPaid = list.some(
    (p) => p.mois === moisCourant && p.statut_id === STATUT_CONFIRME,
  );
  const occupationEnAttente =
    !!villa && me.data?.occupation_confirmee === false;

  return (
    <>
      <PageHeader
        title="Cotisation"
        subtitle={`Mois en cours · ${formatMonth(moisCourant)}`}
      />

      <div className="mx-auto w-full max-w-6xl md:px-8">
        {/* ── En-tête mobile ── */}
        <div className="flex items-center gap-3 px-5 pb-3 pt-4 md:hidden">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-extrabold tracking-[-.3px] text-ink">
            Cotisation
          </h1>
        </div>

        {/* ── Grille : solde + paiement | historique ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] md:gap-6 md:pt-6">
          {/* Colonne gauche — solde + paiement */}
          <div>
            {/* Hero solde annuel */}
            <div
              className="relative mx-4 overflow-hidden rounded-xl p-6 md:mx-0"
              style={{ background: "linear-gradient(145deg, #0D6E5A, #052820)" }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(60deg, rgba(255,255,255,.02) 0px, rgba(255,255,255,.02) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(-60deg, rgba(255,255,255,.02) 0px, rgba(255,255,255,.02) 1px, transparent 1px, transparent 18px)",
                }}
              />
              <div className="relative z-[1]">
                <div className="mb-1 text-[11px] font-semibold tracking-[.06em] text-white/50">
                  SOLDE ANNUEL
                </div>
                <div className="text-[42px] font-extrabold tracking-[-1.5px] text-white">
                  {formatFCFA(totalPaid)}
                </div>
                <div className="mb-5 text-xs font-medium text-white/50">
                  FCFA · {moisPayes} mois payés sur 12
                </div>
              </div>
              <div className="relative z-[1] flex items-center justify-between rounded-md bg-white/10 px-3.5 py-3">
                <span className="text-xs font-medium text-white/60">
                  Mois en cours
                </span>
                <span className="text-[13px] font-bold text-white">
                  {formatMonth(moisCourant)}
                </span>
              </div>
            </div>

            <div className="mx-4 mt-4 md:mx-0">
              {occupationEnAttente ? (
                <div className="rounded-md bg-gold-soft px-4 py-3 text-center text-xs font-semibold text-gold">
                  Votre occupation de villa est en attente de validation par le
                  syndic. Le paiement sera disponible une fois validée.
                </div>
              ) : (
                <PaystackButton
                  villaId={villaId ?? ""}
                  mois={moisCourant}
                  montant={montant}
                  disabled={!villaId || currentPaid}
                />
              )}
              {currentPaid && (
                <p className="mt-2 text-center text-xs font-semibold text-emerald">
                  Cotisation de {formatMonth(moisCourant)} déjà payée ✓
                </p>
              )}
            </div>
          </div>

          {/* Colonne droite — historique */}
          <div>
            {/* Titre mobile */}
            <div className="flex items-center justify-between px-5 pb-2.5 pt-5 md:hidden">
              <h2 className="text-base font-extrabold tracking-[-.3px] text-ink">
                Historique
              </h2>
            </div>
            {/* Titre desktop */}
            <div className="mb-3 hidden items-center justify-between md:flex">
              <h2 className="text-[15px] font-extrabold tracking-[-.2px] text-ink">
                Historique des paiements
              </h2>
              <span className="text-[11px] font-semibold text-ink-3">
                {list.length} mois
              </span>
            </div>
            {paiements.isLoading ? (
              <Skeleton className="mx-4 h-44 rounded-md md:mx-0" />
            ) : (
              <HistoriqueList paiements={list} className="md:mx-0" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
