"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  Home,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { villaApi } from "@/lib/api/villa";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCurrentVilla } from "@/lib/hooks/useCurrentVilla";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { PublicCite, PublicVilla } from "@/types/villa.types";

type Etape = "cites" | "villas" | "confirmer" | "succes";

const slide = (dir: 1 | -1) => ({
  initial: { x: 24 * dir, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -24 * dir, opacity: 0 },
  transition: { duration: 0.22, ease: "easeOut" as const },
});

const STATUT_META: Record<
  PublicVilla["statut"],
  { chip: "green" | "neutral" | "gold"; label: string; hint: string }
> = {
  libre: { chip: "green", label: "Libre", hint: "Première occupation" },
  occupee: { chip: "neutral", label: "Occupée", hint: "Colocation possible" },
  en_attente: { chip: "gold", label: "En attente", hint: "Attribution en cours" },
};

/**
 * Self-service « rejoindre une autre cité » : l'habitant choisit une cité,
 * une villa, puis envoie sa candidature. Validation par les occupants
 * (colocation) ou le syndic (première occupation) selon l'état de la villa.
 */
export function RejoindreCiteSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profilActif } = useAuth();
  const me = useCurrentVilla();
  const qc = useQueryClient();

  const [etape, setEtape] = useState<Etape>("cites");
  const [cite, setCite] = useState<PublicCite | null>(null);
  const [villa, setVilla] = useState<PublicVilla | null>(null);
  const [qCites, setQCites] = useState("");
  const [qVillas, setQVillas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const citeCouranteId = profilActif?.citeId;

  const cites = useQuery({
    queryKey: QUERY_KEYS.publicCites(),
    queryFn: villaApi.publicCites,
    enabled: open,
  });

  const villas = useQuery({
    queryKey: cite ? QUERY_KEYS.publicVillas(cite.id) : [],
    queryFn: () => villaApi.publicVillas(cite!.id),
    enabled: open && !!cite && (etape === "villas" || etape === "confirmer"),
  });

  const etapeIndex =
    etape === "cites" ? 0 : etape === "villas" ? 1 : etape === "confirmer" ? 2 : 3;

  const citesFiltered = useMemo(() => {
    const q = qCites.trim().toLowerCase();
    const list = cites.data ?? [];
    const sorted = [...list].sort((a, b) => {
      const aC = a.id === citeCouranteId ? -1 : 0;
      const bC = b.id === citeCouranteId ? -1 : 0;
      if (aC !== bC) return aC - bC;
      return (a.nom || "").localeCompare(b.nom || "");
    });
    if (!q) return sorted;
    return sorted.filter((c) =>
      `${c.nom} ${c.ville ?? ""} ${c.pays ?? ""}`.toLowerCase().includes(q),
    );
  }, [qCites, cites.data, citeCouranteId]);

  const villasFiltered = useMemo(() => {
    const q = qVillas.trim().toLowerCase();
    const list = villas.data ?? [];
    if (!q) return list;
    return list.filter((v) =>
      `${v.numero} ${v.rue ?? ""} ${v.description ?? ""}`.toLowerCase().includes(q),
    );
  }, [qVillas, villas.data]);

  const reset = () => {
    setEtape("cites");
    setCite(null);
    setVilla(null);
    setQCites("");
    setQVillas("");
    setError(null);
    setSending(false);
  };

  const envoyer = async () => {
    if (!cite || !villa) return;
    setSending(true);
    setError(null);
    try {
      await villaApi.candidater(villa.id);
      qc.invalidateQueries({ queryKey: ["villas", "mes-candidatures"] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.publicVillas(cite.id) });
      setEtape("succes");
    } catch (e) {
      setError(apiErrorMessage(e, "La demande n'a pas pu être envoyée"));
    } finally {
      setSending(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={
        etape === "villas"
          ? `Villas · ${cite?.nom ?? ""}`
          : etape === "confirmer"
            ? "Confirmer ma demande"
            : etape === "succes"
              ? "Demande envoyée"
              : "Rejoindre une cité"
      }
    >
      {etape !== "succes" && (
        <div className="mb-4 flex items-center gap-2">
          {["Cité", "Villa", "Demande"].map((label, i) => (
            <div key={label} className="contents">
              {i > 0 && (
                <span
                  className={cn(
                    "h-px w-4 rounded-pill",
                    i <= etapeIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <span
                className={cn(
                  "rounded-pill px-2 py-0.5 text-[10px] font-bold",
                  i === etapeIndex
                    ? "bg-primary text-white"
                    : i < etapeIndex
                      ? "bg-primary-light text-accent"
                      : "bg-surface-2 text-ink-3",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {etape === "cites" && (
          <motion.div key="cites" {...slide(1)} className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 rounded-md bg-surface p-3 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-accent">
                <Home size={17} strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-ink-3">Votre situation</div>
                <div className="truncate text-[13px] font-bold text-ink">
                  {me.data?.cite?.nom ?? profilActif?.citeNom ?? "—"}
                  {me.data?.villa?.numero ? ` · Villa ${me.data.villa.numero}` : ""}
                </div>
              </div>
              <Chip variant="teal">Actuel</Chip>
            </div>

            <div className="relative">
              <Search
                size={16}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
              />
              <input
                value={qCites}
                onChange={(e) => setQCites(e.target.value)}
                placeholder="Rechercher une cité (nom, ville…)"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-[11px] pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent"
              />
            </div>

            {cites.isLoading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-md" />
                ))}
              </div>
            ) : citesFiltered.length === 0 ? (
              <p className="py-6 text-center text-[13px] font-medium text-ink-3">
                Aucune cité trouvée.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {citesFiltered.map((c) => {
                  const estCourante = c.id === citeCouranteId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={estCourante}
                      onClick={() => {
                        setQCites("");
                        setCite(c);
                        setEtape("villas");
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-md bg-surface p-3 text-left shadow-card",
                        estCourante && "opacity-70",
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-accent">
                        <Building2 size={19} strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">
                          {c.nom}
                        </span>
                        <span className="block truncate text-[11px] font-medium text-ink-3">
                          {[c.ville, c.pays].filter(Boolean).join(" · ") || "Cité résidentielle"}
                        </span>
                      </span>
                      {estCourante && <Chip variant="teal">Votre cité</Chip>}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {etape === "villas" && cite && (
          <motion.div key="villas" {...slide(1)} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                setVilla(null);
                setEtape("cites");
              }}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent"
            >
              <ChevronLeft size={16} strokeWidth={2} /> {cite.nom}
            </button>

            <div className="relative">
              <Search
                size={16}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
              />
              <input
                value={qVillas}
                onChange={(e) => setQVillas(e.target.value)}
                placeholder="Rechercher par n° ou rue…"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-[11px] pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent"
              />
            </div>

            {villas.isLoading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-md" />
                ))}
              </div>
            ) : villasFiltered.length === 0 ? (
              <p className="py-6 text-center text-[13px] font-medium text-ink-3">
                Aucune villa disponible ici.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {villasFiltered.map((v) => {
                  const meta = STATUT_META[v.statut];
                  const bloque = v.statut === "en_attente";
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={bloque}
                      onClick={() => {
                        setVilla(v);
                        setEtape("confirmer");
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-md bg-surface p-3 text-left shadow-card",
                        bloque && "opacity-70",
                      )}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2">
                        <Home size={19} strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">
                          Villa {v.numero}
                          {v.rue ? ` · ${v.rue}` : ""}
                        </span>
                        <span className="block truncate text-[11px] font-medium text-ink-3">
                          {meta.hint}
                          {v.nb_occupants_confirmes > 0
                            ? ` · ${v.nb_occupants_confirmes} occupant${v.nb_occupants_confirmes > 1 ? "s" : ""}`
                            : ""}
                        </span>
                      </span>
                      <Chip variant={meta.chip}>{meta.label}</Chip>
                    </button>
                  );
                })}
              </div>
            )}

            <p className="flex items-start gap-1.5 text-[11px] font-medium leading-relaxed text-ink-3">
              <CircleAlert size={13} strokeWidth={1.7} className="mt-0.5 shrink-0" />
              Les villas « En attente » ne sont pas candidates : une demande est déjà en cours pour leur attribution.
            </p>
          </motion.div>
        )}

        {etape === "confirmer" && villa && cite && (
          <motion.div key="confirmer" {...slide(1)} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setEtape("villas")}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-accent"
            >
              <ChevronLeft size={16} strokeWidth={2} /> Choisir une autre villa
            </button>

            <div className="overflow-hidden rounded-md bg-surface shadow-card">
              <div className="flex items-center gap-3 bg-primary-light px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Building2 size={19} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold text-ink">{cite.nom}</div>
                  <div className="truncate text-[11px] font-medium text-ink-3">
                    {[cite.ville, cite.pays].filter(Boolean).join(" · ") || "Cité résidentielle"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-border px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold">
                  <Home size={19} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold text-ink">
                    Villa {villa.numero}
                    {villa.rue ? ` · ${villa.rue}` : ""}
                  </div>
                  <div className="truncate text-[11px] font-medium text-ink-3">
                    {villa.description || STATUT_META[villa.statut].hint}
                  </div>
                </div>
                <Chip variant={STATUT_META[villa.statut].chip}>
                  {STATUT_META[villa.statut].label}
                </Chip>
              </div>
            </div>

            <div className="rounded-md bg-primary-light p-3">
              <p className="text-[12px] font-bold text-ink">Comment ça se passe ?</p>
              <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-ink-2">
                {villa.nb_occupants_confirmes > 0
                  ? "Villa occupée : les habitants confirmés de la villa valideront ou refuseront votre demande de colocation."
                  : "Villa libre : le syndic de la cité étudiera votre demande de première occupation. Vous serez notifié·e dès la décision."}
              </p>
            </div>

            {error && (
              <p className="flex items-start gap-1.5 rounded-md bg-danger-soft px-3 py-2.5 text-xs font-semibold text-danger">
                <CircleAlert size={14} strokeWidth={1.7} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}

            <Button
              fullWidth
              size="lg"
              loading={sending}
              onClick={envoyer}
              className="rounded-md py-4 text-[15px]"
            >
              Envoyer ma demande
            </Button>
          </motion.div>
        )}

        {etape === "succes" && villa && cite && (
          <motion.div key="succes" {...slide(1)} className="flex flex-col items-center px-2 py-8 text-center">
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-emerald-soft text-emerald"
            >
              <CheckCircle2 size={38} strokeWidth={1.7} />
            </motion.span>
            <h3 className="mt-4 text-[18px] font-extrabold tracking-[-.3px] text-ink">
              Demande envoyée !
            </h3>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink-3">
              Votre demande pour la{" "}
              <span className="font-semibold text-ink-2">
                Villa {villa.numero} · {cite.nom}
              </span>{" "}
              a bien été transmise.
              <br />
              Vous serez notifié·e dès qu'une décision sera prise.
            </p>
            <div className="mt-5 flex items-center gap-3 text-[11px] font-medium text-ink-3">
              <Users size={14} strokeWidth={1.7} className="shrink-0" />
              Suivi dans l'onglet Colocations
            </div>
            <Button
              fullWidth
              size="lg"
              className="mt-6 rounded-md py-4 text-[15px]"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Fermer
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}