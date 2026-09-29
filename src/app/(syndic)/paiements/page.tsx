"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  Loader2,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { api } from "@/lib/api/axios";
import { paiementApi } from "@/lib/api/paiement";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { villaApi } from "@/lib/api/villa";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { currentMonth } from "@/lib/utils/cotisation";
import { formatFCFA } from "@/lib/utils/formatFCFA";
import { formatMonth } from "@/lib/utils/formatDate";

const CANAUX = [
  { code: "WAVE_MANUEL", label: "Wave" },
  { code: "ORANGE_MANUEL", label: "Orange Money" },
  { code: "MTN_MANUEL", label: "MTN MoMo" },
  { code: "CASH", label: "Espèces" },
];

const STATUTS = [
  { id: "", label: "Tous les statuts" },
  { id: "1", label: "En attente" },
  { id: "2", label: "Confirmé" },
  { id: "3", label: "Échoué" },
  { id: "4", label: "Remboursé" },
];

const PAGE_SIZE = 10;

export default function SyndicPaiementsPage() {
  const [open, setOpen] = useState(false);
  const [initialMois, setInitialMois] = useState("");
  const [page, setPage] = useState(1);
  const [fMois, setFMois] = useState("");
  const [fStatut, setFStatut] = useState("");
  const [fVilla, setFVilla] = useState("");

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("saisie") === "1") {
      setOpen(true);
      setInitialMois(sp.get("mois") ?? "");
    }
  }, []);

  const villas = useQuery({ queryKey: ["villas", "all"], queryFn: villaApi.list });

  const crit = useMemo(() => {
    const p: Record<string, string | number | undefined> = {
      sort: "-created_at",
      include: "statut_paiement,canal_paiement,villa",
      page,
      size: PAGE_SIZE,
    };
    if (fMois) p["mois.eq"] = fMois;
    if (fStatut) p["statut_id.eq"] = fStatut;
    if (fVilla) p["villa_id.eq"] = fVilla;
    return p;
  }, [page, fMois, fStatut, fVilla]);

  const paiements = useQuery({
    queryKey: ["paiements", page, fMois, fStatut, fVilla],
    queryFn: () => paiementApi.getByCriteria(crit),
    placeholderData: (prev) => prev,
  });

  const list = paiements.data?.items ?? [];
  const total = paiements.data?.total ?? 0;
  const pages = paiements.data?.pages ?? 1;
  const safePage = Math.min(page, pages);
  const hasFilters = Boolean(fMois || fStatut || fVilla);

  const exportExcel = useMutation({
    mutationFn: () => paiementApi.exportExcel(),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paiements.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const [recuId, setRecuId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Paiements"
        subtitle="Suivi des cotisations de la cité"
        actions={
          <>
            <button
              onClick={() => exportExcel.mutate()}
              className="inline-flex items-center gap-2 rounded-md bg-surface-2 px-4 py-3 text-sm font-bold text-ink-2"
            >
              <FileDown size={16} strokeWidth={1.7} /> Export Excel
            </button>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-white shadow-btn"
            >
              <Plus size={16} strokeWidth={2} /> Saisie manuelle
            </button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
            Paiements
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn md:hidden"
            aria-label="Saisie manuelle"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Filtres */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:flex md:items-center">
          <input
            type="month"
            value={fMois}
            onChange={(e) => {
              setFMois(e.target.value);
              setPage(1);
            }}
            className="col-span-2 rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-accent md:w-auto"
            aria-label="Filtrer par mois"
          />
          <Select
            size="sm"
            className="md:w-auto"
            value={fStatut}
            onChange={(v) => {
              setFStatut(v);
              setPage(1);
            }}
            placeholder="Tous les statuts"
            options={STATUTS.map((s) => ({ value: s.id, label: s.label }))}
          />
          <Select
            size="sm"
            value={fVilla}
            onChange={(v) => {
              setFVilla(v);
              setPage(1);
            }}
            placeholder="Toutes les villas"
            className="col-span-2 md:w-[220px]"
            options={(villas.data ?? []).map((v) => ({
              value: v.id,
              label: `Villa ${v.numero}${v.rue ? ` · ${v.rue}` : ""}`,
            }))}
          />
          {hasFilters && (
            <button
              onClick={() => {
                setFMois("");
                setFStatut("");
                setFVilla("");
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-2 text-[13px] font-bold text-ink-2"
            >
              <RotateCcw size={14} strokeWidth={2} /> Réinitialiser
            </button>
          )}
        </div>

        {paiements.isLoading && list.length === 0 ? (
          <div className="mt-5 flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Download}
            tone="teal"
            title="Aucun paiement"
            subtitle={
              hasFilters
                ? "Aucun paiement ne correspond aux filtres."
                : "Les paiements enregistrés apparaîtront ici."
            }
          />
        ) : (
          <div className="mt-5 overflow-hidden rounded-md bg-surface shadow-card">
            {list.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ink">
                    Villa {p.villa?.numero ?? "—"}
                    {p.villa?.rue ? ` · ${p.villa.rue}` : ""} · {formatMonth(p.mois)}
                  </div>
                  <div className="text-[12px] font-medium text-ink-3">
                    {p.canal_paiement?.libelle ?? "—"}
                    {p.reference_externe ? ` · ${p.reference_externe}` : ""}
                  </div>
                </div>
                <div className="text-sm font-bold text-ink">
                  {formatFCFA(p.montant)} FCFA
                </div>
                <StatusPill
                  tone={
                    p.statut_paiement?.code === "CONFIRME"
                      ? "success"
                      : p.statut_paiement?.code === "EN_ATTENTE"
                        ? "warning"
                        : p.statut_paiement?.code === "REMBOURSE"
                          ? "info"
                          : "danger"
                  }
                >
                  {p.statut_paiement?.libelle ?? "—"}
                </StatusPill>
                <button
                  onClick={() => p.id && setRecuId(p.id)}
                  aria-label="Reçu"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-3"
                >
                  <Download size={16} strokeWidth={1.7} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink-3">
            {total} paiement{total > 1 ? "s" : ""}
          </span>
          {pages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-ink-3 shadow-card disabled:opacity-40"
                aria-label="Précédent"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="text-[13px] font-semibold text-ink-2">
                {safePage} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={safePage >= pages}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-surface text-ink-3 shadow-card disabled:opacity-40"
                aria-label="Suivant"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>

      <SaisieManuelleSheet
        open={open}
        onClose={() => setOpen(false)}
        initialMois={initialMois}
      />

      <RecuModal recuId={recuId} onClose={() => setRecuId(null)} />
    </>
  );
}

function SaisieManuelleSheet({
  open,
  onClose,
  initialMois = "",
}: {
  open: boolean;
  onClose: () => void;
  initialMois?: string;
}) {
  const qc = useQueryClient();
  const [villaId, setVillaId] = useState("");
  // Mois présélectionné : celui passé en paramètre (régularisation) sinon le
  // mois courant — le syndic ne devrait pas avoir à le saisir à la main.
  const [mois, setMois] = useState(initialMois || currentMonth());
  const [montant, setMontant] = useState("");
  const [canal, setCanal] = useState("WAVE_MANUEL");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preuve, setPreuve] = useState<File | null>(null);

  useEffect(() => {
    if (open) setMois(initialMois || currentMonth());
  }, [open, initialMois]);

  const villas = useQuery({
    queryKey: ["villas", "all"],
    queryFn: villaApi.list,
    enabled: open,
  });

  const save = useMutation({
    mutationFn: () =>
      paiementApi.manuel({
        villa_id: villaId,
        mois: [mois],
        montant: Number(montant),
        canal,
        reference_externe: reference.trim() || undefined,
        note: note.trim() || undefined,
        preuve,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["paiements"] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary() });
      setVillaId("");
      setMois("");
      setMontant("");
      setReference("");
      setNote("");
      setPreuve(null);
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Saisie impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Saisie manuelle">
      <div className="flex flex-col gap-4">
        <Field label="Villa">
          <Select
            value={villaId}
            onChange={setVillaId}
            placeholder="Choisir une villa…"
            options={(villas.data ?? []).map((v) => ({
              value: v.id,
              label: `Villa ${v.numero}${v.rue ? ` · ${v.rue}` : ""}`,
            }))}
          />
        </Field>

        <Field label="Mois">
          <input
            type="month"
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
          />
        </Field>

        <Field label="Montant (FCFA)">
          <input
            type="number"
            inputMode="numeric"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="25000"
            className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
          />
        </Field>

        <Field label="Canal">
          <Select
            value={canal}
            onChange={setCanal}
            options={CANAUX.map((c) => ({ value: c.code, label: c.label }))}
          />
        </Field>

        <Field label="Référence externe (optionnel)">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="REF-WAVE-2026-09"
            className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
          />
        </Field>

        <Field label="Note (optionnel)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Régularisation septembre"
            className="rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
          />
        </Field>

        <Field label="Preuve de paiement (optionnel)">
          <PhotoUpload
            value={preuve}
            onChange={setPreuve}
            label="Joindre une preuve de paiement"
          />
        </Field>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={save.isPending}
          onClick={() => save.mutate()}
          disabled={!villaId || !mois || !montant}
          className="rounded-md py-4 text-[15px]"
        >
          Enregistrer le paiement
        </Button>
      </div>
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-xs font-bold tracking-[.02em] text-ink-2">{label}</label>
      {children}
    </div>
  );
}

function RecuModal({ recuId, onClose }: { recuId: string | null; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recuId) {
      setImageUrl(null);
      setError(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const recu = await paiementApi.recu(recuId);
        const previewPath = (recu.preview_url ?? "").replace(/^\/api/, "");
        const blob = (
          await api.get(previewPath, { responseType: "blob" })
        ).data as Blob;
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch {
        if (!cancelled) setError("Reçu indisponible");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recuId]);

  return (
    <BottomSheet open={!!recuId} onClose={onClose} title="Reçu de paiement">
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 size={24} strokeWidth={1.7} className="animate-spin text-accent" />
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm font-semibold text-danger">{error}</p>
        ) : imageUrl ? (
          <>
            <div className="overflow-hidden rounded-md border border-border bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Reçu de paiement" className="w-full" />
            </div>
            <div className="flex items-center gap-2">
              <a
                href={imageUrl}
                download="recu.png"
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-white"
              >
                <Download size={16} strokeWidth={2} /> Télécharger
              </a>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-2 text-ink-3"
                aria-label="Fermer"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </BottomSheet>
  );
}
