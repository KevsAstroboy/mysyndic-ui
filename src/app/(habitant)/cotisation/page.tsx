"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils/cn";

const STATUT_EN_ATTENTE = 1;

/** Mois de l'année courante, de janvier au mois donné (inclus). */
function currentYearMonths(moisCourant: string): string[] {
  const [y, m] = moisCourant.split("-").map(Number);
  const out: string[] = [];
  for (let i = 1; i <= m; i++) {
    out.push(`${y}-${String(i).padStart(2, "0")}`);
  }
  return out;
}

/** Mois suivant une référence YYYY-MM. */
function nextMonth(mois: string): string {
  const [y, m] = mois.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortMonth(mois: string): string {
  const label = formatMonth(mois).split(" ")[0] ?? "";
  const s = label.slice(0, 3).replace(/\.$/, "");
  return s.charAt(0).toUpperCase() + s.slice(1) || label;
}

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
  const currentYear = moisCourant.slice(0, 4);
  const montant = config.data?.cotisation_mensuelle ?? 25000;
  const list = paiements.data ?? [];
  const totalPaid = list
    .filter((p) => p.statut_id === STATUT_CONFIRME)
    .reduce((s, p) => s + p.montant, 0);
  const moisPayes = list.filter((p) => p.statut_id === STATUT_CONFIRME).length;
  const occupationEnAttente = !!villa && me.data?.occupation_confirmee === false;

  // Grille = mois de l'année courante uniquement (janvier → mois en cours).
  const months = useMemo(
    () => currentYearMonths(moisCourant),
    [moisCourant],
  );

  const confirmed = useMemo(() => {
    const s = new Set<string>();
    for (const p of list) if (p.statut_id === STATUT_CONFIRME) s.add(p.mois);
    return s;
  }, [list]);
  // Un mois est « bloqué » seulement s'il a un paiement EN_ATTENTE (live).
  // Un paiement échoué (ECHOUE) ou annulé (ANNULE) doit rester re-sélectionnable.
  const pending = useMemo(() => {
    const s = new Set<string>();
    for (const p of list) if (p.statut_id === STATUT_EN_ATTENTE) s.add(p.mois);
    return s;
  }, [list]);

  // Mois impayés AVANT l'année courante (ancrés sur le plus vieux paiement
  // connu). Ils restent régularisables via la section « antérieurs ».
  const arrears = useMemo(() => {
    const start = `${currentYear}-01`;
    let anchor = start;
    for (const p of list) if (p.mois < anchor) anchor = p.mois;
    if (anchor >= start) return [];
    const out: string[] = [];
    let m = anchor;
    while (m < start && out.length < 24) {
      if (!confirmed.has(m)) out.push(m);
      m = nextMonth(m);
    }
    return out;
  }, [list, confirmed, currentYear]);

  const paymentMonth = useMemo(() => {
    const unpaid = months.filter((m) => !confirmed.has(m) && !pending.has(m));
    if (unpaid[0]) return unpaid[0];
    // Rien d'autre à régler : on présélectionne le mois en attente, que
    // l'utilisateur peut relancer (nouvelle session Paystack sur la même ligne).
    const wait = months.filter((m) => !confirmed.has(m) && pending.has(m));
    return wait[0] ?? "";
  }, [months, confirmed, pending]);

  const [selected, setSelected] = useState<string[]>([]);
  const [includeArrears, setIncludeArrears] = useState(false);
  useEffect(() => {
    setSelected(paymentMonth ? [paymentMonth] : []);
  }, [paymentMonth]);

  const toggle = (mois: string) => {
    setSelected((sel) =>
      sel.includes(mois) ? sel.filter((m) => m !== mois) : [...sel, mois],
    );
  };

  const visibleArrears = includeArrears ? arrears : [];
  const selectAllUnpaid = () =>
    setSelected([
      ...months.filter((m) => !confirmed.has(m) && !pending.has(m)),
      ...visibleArrears,
    ]);

  const sorted = [...new Set([...selected])].sort();
  const total = sorted.length * montant;
  const arrearsRemaining = arrears.filter(
    (m) => !confirmed.has(m) && !pending.has(m),
  ).length;
  const trulyUpToDate =
    sorted.length === 0 &&
    pending.size === 0 &&
    arrearsRemaining === 0;

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

            {/* Sélecteur de mois */}
            <div className="mx-4 mt-4 rounded-md bg-surface p-4 shadow-card md:mx-0">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-extrabold tracking-[-.2px] text-ink">
                  Régulariser vos cotisations
                </div>
                <button
                  onClick={selectAllUnpaid}
                  className="text-[11px] font-bold text-accent"
                >
                  Tout sélectionner
                </button>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-ink-3">
                Choisissez un ou plusieurs mois passés, ou le mois en cours.
              </p>

              <div className="mt-3 grid grid-cols-4 gap-2 lg:grid-cols-6">
                {months.map((mois) => {
                  const paid = confirmed.has(mois);
                  const wait = !paid && pending.has(mois);
                  const active = selected.includes(mois);
                  const disabled = paid || occupationEnAttente;
                  return (
                    <button
                      key={mois}
                      type="button"
                      disabled={disabled}
                      aria-pressed={active}
                      onClick={() => toggle(mois)}
                      title={disabled ? undefined : formatMonth(mois)}
                      className={cn(
                        "relative flex flex-col items-center gap-0.5 rounded-md border-[1.5px] px-1 py-2 transition-colors",
                        paid
                          ? "border-emerald bg-emerald-soft"
                          : active
                            ? "border-accent bg-primary-light"
                            : wait
                              ? "border-border bg-surface-2 opacity-60"
                              : "border-border bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-extrabold",
                          paid
                            ? "text-emerald"
                            : active
                              ? "text-accent"
                              : wait
                                ? "text-ink-3"
                                : "text-ink-2",
                        )}
                      >
                        {shortMonth(mois)}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-semibold",
                          paid
                            ? "text-emerald"
                            : active
                              ? "text-accent"
                              : "text-ink-3",
                        )}
                      >
                        {mois.slice(2, 4)}
                      </span>
                      {paid ? (
                        <Check size={12} strokeWidth={2.5} className="text-emerald" />
                      ) : active ? (
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-primary">
                          <Check size={8} strokeWidth={3} className="text-white" />
                        </span>
                      ) : wait ? (
                        <Clock3 size={11} strokeWidth={1.7} className="text-ink-3" />
                      ) : (
                        <span className="h-3 w-3 rounded-full border border-border" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mois antérieurs à l'année courante — régularisables */}
              {arrearsRemaining > 0 && !includeArrears && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-gold/40 bg-gold-soft px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-gold">
                    {arrearsRemaining} mois antérieur{arrearsRemaining > 1 ? "s" : ""} à {currentYear} non
                    réglé{arrearsRemaining > 1 ? "s" : ""}.
                  </p>
                  <button
                    onClick={() => setIncludeArrears(true)}
                    className="shrink-0 text-[11px] font-bold text-gold underline"
                  >
                    Régulariser
                  </button>
                </div>
              )}

              {visibleArrears.length > 0 && (
                <>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[11px] font-extrabold uppercase tracking-[.06em] text-ink-3">
                      Mois antérieurs à {currentYear}
                    </div>
                    <button
                      onClick={() => {
                        setIncludeArrears(false);
                        setSelected((s) => s.filter((m) => !arrears.includes(m)));
                      }}
                      className="text-[10px] font-bold text-ink-3"
                    >
                      Masquer
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {visibleArrears.map((mois) => {
                      const wait = pending.has(mois);
                      const active = selected.includes(mois);
                      return (
                        <button
                          key={mois}
                          type="button"
                          disabled={wait}
                          aria-pressed={active}
                          onClick={() => toggle(mois)}
                          className={cn(
                            "rounded-pill border-[1.5px] px-3 py-1.5 text-[11px] font-bold transition-colors",
                            wait
                              ? "border-border bg-surface-2 text-ink-3"
                              : active
                                ? "border-gold bg-gold-soft text-gold"
                                : "border-border bg-surface-2 text-ink-2",
                          )}
                        >
                          {formatMonth(mois)}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {sorted.length > 0 && (
                <div className="mt-3 flex items-center justify-between rounded-md bg-surface-2 px-3 py-2.5">
                  <span className="text-[11px] font-semibold text-ink-2">
                    {sorted.length === 1
                      ? `${formatMonth(sorted[0])}`
                      : `${formatMonth(sorted[0])} → ${formatMonth(sorted[sorted.length - 1])}`}
                  </span>
                  <span className="text-[13px] font-extrabold text-ink">
                    {formatFCFA(total)} FCFA
                  </span>
                </div>
              )}
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
                  mois={sorted}
                  montant={total}
                  disabled={!villaId}
                />
              )}
              {sorted.length === 0 && !occupationEnAttente && pending.size > 0 && (
                <p className="mt-2 text-center text-xs font-semibold text-gold">
                  Paiement en attente pour{" "}
                  {[...pending].sort().map(formatMonth).join(", ")} — sélectionne
                  le mois pour reprendre.
                </p>
              )}
              {trulyUpToDate && (
                <p className="mt-2 text-center text-xs font-semibold text-emerald">
                  Tous vos mois sont à jour ✓
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