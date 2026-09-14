"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  Download,
  FileSpreadsheet,
  Home,
  Plus,
  Trash2,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector, usePeriod } from "@/components/layout/PeriodSelector";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";
import { UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { citeApi } from "@/lib/api/cite";
import { userApi } from "@/lib/api/user";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { computeGlobalStats } from "@/lib/utils/citeStats";
import { cn } from "@/lib/utils/cn";
import { formatFCFA } from "@/lib/utils/formatFCFA";

function compactFCFA(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1).replace(".", ",")}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function CitesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [villaCite, setVillaCite] = useState<{ id: string; nom: string } | null>(null);
  const [syndicCite, setSyndicCite] = useState<{ id: string; nom: string } | null>(null);
  const { mode, setMode, mois, setMois, debut, setDebut, fin, setFin, params, periodLabel, isRange } =
    usePeriod();

  const cites = useQuery({
    queryKey: [...QUERY_KEYS.cites(), mode, mois, debut, fin],
    queryFn: () => citeApi.list(params),
  });

  const toggle = useMutation({
    mutationFn: (c: { id: string; is_active?: boolean }) =>
      citeApi.update(c.id, { is_active: !c.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() }),
  });

  const list = cites.data ?? [];
  const stats = useMemo(() => computeGlobalStats(list), [list]);

  return (
    <>
      <PageHeader
        title="Toutes les cités"
        subtitle={`Vue agrégée · ${periodLabel}`}
        actions={
          <>
            <PeriodSelector
              mode={mode}
              setMode={setMode}
              mois={mois}
              setMois={setMois}
              debut={debut}
              setDebut={setDebut}
              fin={fin}
              setFin={setFin}
            />
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} strokeWidth={2} /> Nouvelle cité
            </Button>
          </>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
            Cités
          </h1>
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn md:hidden"
            aria-label="Nouvelle cité"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Sélecteur de période mobile */}
        <div className="mt-4 md:hidden">
          <PeriodSelector
            mode={mode}
            setMode={setMode}
            mois={mois}
            setMois={setMois}
            debut={debut}
            setDebut={setDebut}
            fin={fin}
            setFin={setFin}
          />
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Cités actives" value={String(stats.actives)} icon={Building2} tone="teal" />
          <Kpi label="Habitants totaux" value={String(stats.habitants)} icon={Users} tone="purple" />
          <Kpi
            label={`Revenus (${periodLabel})`}
            value={`${compactFCFA(stats.revenus)} FCFA`}
            icon={Wallet}
            tone="gold"
          />
          <Kpi label="Taux global" value={`${stats.tauxGlobal}%`} icon={Home} tone="teal" />
        </div>

        <h2 className="mb-2 mt-6 text-[15px] font-extrabold text-ink">
          Cités déployées
        </h2>

        {cites.isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-44 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => {
              const active = c.is_active !== false;
              const taux = c.stats?.taux_recouvrement_pct ?? 0;
              const revenus = c.stats?.montant_collecte ?? 0;
              return (
                <div
                  key={c.id}
                  className="relative overflow-hidden rounded-md bg-surface p-5 shadow-card pt-[21px]"
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1",
                      active
                        ? "bg-gradient-to-r from-primary to-emerald"
                        : "bg-border",
                    )}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-extrabold tracking-[-.2px] text-ink">
                        {c.nom}
                      </div>
                      <div className="truncate text-[11px] font-semibold text-ink-3">
                        {[c.ville, c.pays].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                    <button
                      onClick={() => toggle.mutate(c)}
                      disabled={toggle.isPending}
                      className={cn(
                        "relative h-[26px] w-11 shrink-0 rounded-pill p-[3px] transition-colors",
                        active ? "justify-end bg-emerald" : "justify-start bg-border",
                        "flex",
                      )}
                      aria-label={active ? "Désactiver" : "Activer"}
                      title={active ? "Désactiver la cité" : "Activer la cité"}
                    >
                      <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.2)]" />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-lg font-extrabold tracking-[-.3px] text-ink">
                        {c.stats?.nb_villas ?? 0}
                      </div>
                      <div className="text-[10px] font-semibold text-ink-3">Villas</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold tracking-[-.3px] text-ink">
                        {c.stats?.nb_habitants ?? 0}
                      </div>
                      <div className="text-[10px] font-semibold text-ink-3">Habitants</div>
                    </div>
                    <div>
                      <div className="text-lg font-extrabold tracking-[-.3px] text-ink">
                        {compactFCFA(revenus)}
                      </div>
                      <div className="text-[10px] font-semibold text-ink-3">FCFA/mois</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-[5px] flex-1 overflow-hidden rounded-pill bg-surface-2">
                      <div
                        className={cn(
                          "h-full rounded-pill",
                          taux >= 60
                            ? "bg-gradient-to-r from-emerald to-primary"
                            : "bg-gold",
                        )}
                        style={{ width: `${Math.min(taux, 100)}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-extrabold",
                        taux >= 60 ? "text-primary" : "text-gold",
                      )}
                    >
                      {taux}%
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-ink-3">
                      {c.stats?.nb_confirmes ?? 0}/{c.stats?.nombre_villas_attendu ?? 0} villas à jour
                    </span>
                    <span
                      className={cn(
                        "rounded-pill px-2 py-0.5 text-[10px] font-bold",
                        active
                          ? "bg-emerald-soft text-emerald"
                          : "bg-surface-2 text-ink-3 border border-border",
                      )}
                    >
                      {active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="mt-3 border-t border-border pt-3">
                    <button
                      onClick={() => setVillaCite({ id: c.id, nom: c.nom })}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary-light px-3 py-2 text-[12px] font-bold text-primary"
                    >
                      <Plus size={14} strokeWidth={2} /> Ajouter une villa
                    </button>
                    <button
                      onClick={() => setSyndicCite({ id: c.id, nom: c.nom })}
                      className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-2 text-[12px] font-bold text-ink-2"
                    >
                      <UserRound size={14} strokeWidth={2} /> Créer le syndic
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateCiteSheet open={open} onClose={() => setOpen(false)} />
      <AddVillaSheet cite={villaCite} onClose={() => setVillaCite(null)} />
      <CreateSyndicSheet cite={syndicCite} onClose={() => setSyndicCite(null)} />
    </>
  );
}

function CreateSyndicSheet({
  cite,
  onClose,
}: {
  cite: { id: string; nom: string } | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: () =>
      userApi.createStaff({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone || undefined,
        profil_code: "SYNDIC",
        cite_id: cite?.id,
      }),
    onSuccess: () => {
      setDone(true);
      setForm({ prenom: "", nom: "", email: "", telephone: "" });
    },
    onError: (e) => setError(apiErrorMessage(e, "Création impossible")),
  });

  return (
    <BottomSheet
      open={!!cite}
      onClose={onClose}
      title={`Créer le syndic — ${cite?.nom ?? ""}`}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-medium text-ink-3">
          Le syndic activera son compte via l'email (mot de passe temporaire), puis
          pourra lui-même créer les autres comptes staff de la cité.
        </p>
        {done && (
          <p className="flex items-center gap-1.5 text-[12px] font-bold text-emerald">
            <Check size={14} strokeWidth={2} /> Syndic créé — email d'activation envoyé.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.prenom}
            onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
            placeholder="Prénom"
            className="rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
          />
          <input
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            placeholder="Nom"
            className="rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
          />
        </div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Email"
          className="w-full rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
        />
        <input
          value={form.telephone}
          onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
          placeholder="Téléphone (optionnel)"
          className="w-full rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary"
        />
        {error && <p className="text-xs font-semibold text-danger">{error}</p>}
        <Button
          fullWidth
          size="lg"
          loading={mutation.isPending}
          disabled={!form.prenom.trim() || !form.nom.trim() || !form.email.trim()}
          onClick={() => mutation.mutate()}
          className="rounded-md py-4 text-[15px]"
        >
          Créer le syndic
        </Button>
      </div>
    </BottomSheet>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: "teal" | "gold" | "purple";
}) {
  const tones = {
    teal: "bg-primary-light text-primary",
    gold: "bg-gold-soft text-gold",
    purple: "bg-[#EDE8FD] text-[#7C3AED]",
  };
  return (
    <div className="rounded-md bg-surface p-3.5 shadow-card md:p-4">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-sm", tones[tone])}>
        <Icon size={16} strokeWidth={1.7} />
      </span>
      <div className="mt-2.5 truncate text-[18px] font-extrabold tracking-[-.4px] text-ink md:text-[24px]">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-ink-3 md:text-[11px]">{label}</div>
    </div>
  );
}

interface VillaRow {
  numero: string;
  rue: string;
  description: string;
}

const emptyRow = (): VillaRow => ({ numero: "", rue: "", description: "" });

interface ParsedRow {
  index: number;
  ligne: number;
  numero: string;
  rue?: string;
  description?: string;
  erreur?: string;
}

/** Colonnes du template Excel (ligne d'en-tête). */
const TEMPLATE_HEADER = ["N° villa", "Rue", "Description"];
const TEMPLATE_EXAMPLE = ["15", "Rue des Palmiers", "Villa proche du portail"];

function isHeaderRow(cells: (string | number | null | undefined)[]): boolean {
  const first = String(cells[0] ?? "").trim().toLowerCase();
  return /numero|n°|villa|numero_villa/i.test(first) || first === "";
}

function AddVillaSheet({
  cite,
  onClose,
}: {
  cite: { id: string; nom: string } | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"form" | "import">("form");
  const [rows, setRows] = useState<VillaRow[]>([emptyRow()]);
  const [formError, setFormError] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validFormRows = () =>
    rows.map((r) => ({
      numero: r.numero.trim(),
      rue: r.rue.trim() || undefined,
      description: r.description.trim() || undefined,
    }));

  const submitRows = (list: { numero: string; rue?: string; description?: string }[]) => {
    setSubmitting(true);
    setFormError(null);
    setImportError(null);
    Promise.all(
      list.map((r) => citeApi.addVilla(cite!.id, r)),
    )
      .then(() => {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
        setRows([emptyRow()]);
        setParsed([]);
        setFileName("");
        onClose();
      })
      .catch((e) => setFormError(apiErrorMessage(e, "Échec de l'enregistrement")))
      .finally(() => setSubmitting(false));
  };

  const submitForm = () => {
    const filled = validFormRows().filter((r) => r.numero);
    if (filled.length === 0) {
      setFormError("Renseignez au moins un numéro de villa.");
      return;
    }
    submitRows(filled);
  };

  const resetImport = () => {
    setFileName("");
    setParsed([]);
    setImportError(null);
  };

  const downloadTemplate = async () => {
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADER, TEMPLATE_EXAMPLE]);
      XLSX.utils.book_append_sheet(wb, ws, "Villas");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
      const url = URL.createObjectURL(new Blob([buf as ArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "modele-villas.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setImportError("Impossible de générer le modèle.");
    }
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setImportError(null);
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(data));
      const sheet = wb.Sheets?.[wb.SheetNames?.[0] ?? ""];
      const sheetData: (string | number | null | undefined)[][] = sheet
        ? (XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as (string | number | null | undefined)[][])
        : [];
      parseImportRows(sheetData, file.name);
    } catch {
      setImportError("Ce fichier n'est pas un Excel valide (.xlsx).");
    }
  };

  const parseImportRows = (sheetData: (string | number | null | undefined)[][], name: string) => {
    const seen = new Map<string, number>();
    const out: ParsedRow[] = [];

    sheetData.slice(0, 1000).forEach((cells, idx) => {
      if (idx === 0 && isHeaderRow(cells)) return;
      const [a, b, c] = [
        String(cells[0] ?? "").trim(),
        String(cells[1] ?? "").trim(),
        String(cells[2] ?? "").trim(),
      ];
      if (!a && !b && !c) return; // ligne vide
      const ligne = idx + 1;
      if (!a) {
        out.push({ index: out.length, ligne, numero: "", erreur: "Numéro manquant" });
        return;
      }
      if (a.length > 20 || b.length > 120 || c.length > 120) {
        out.push({ index: out.length, ligne, numero: a, rue: b || undefined, description: c || undefined, erreur: "Valeur trop longue (max 20/120 caractères)" });
        return;
      }
      if (seen.has(a)) {
        out.push({ index: out.length, ligne, numero: a, rue: b || undefined, description: c || undefined, erreur: `Numéro dupliqué (déjà à la ligne ${seen.get(a)})` });
        return;
      }
      seen.set(a, ligne);
      out.push({ index: out.length, ligne, numero: a, rue: b || undefined, description: c || undefined });
    });

    if (out.length === 0) {
      setImportError("Aucune ligne de villa trouvée dans le fichier.");
      setParsed([]);
      setFileName("");
      return;
    }
    setFileName(name);
    setParsed(out);
  };

  const submitImport = () => {
    const list = parsed
      .filter((p) => !p.erreur)
      .map((p) => ({ numero: p.numero, rue: p.rue || undefined, description: p.description || undefined }));
    if (list.length === 0) return;
    submitRows(list);
  };

  return (
    <BottomSheet open={!!cite} onClose={onClose} title={`Ajouter des villas — ${cite?.nom ?? ""}`}>
      <div className="mb-1 flex gap-2">
        {(
          [
            { key: "form", label: "Formulaire" },
            { key: "import", label: "Import Excel" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={mode === t.key}
            onClick={() => setMode(t.key)}
            className={cn(
              "rounded-pill px-3 py-1.5 text-[12px] font-bold",
              mode === t.key ? "bg-primary text-white" : "bg-surface-2 text-ink-3",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mode === "form" ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-md bg-emerald-soft border border-border p-3">
            <p className="text-[12px] font-bold text-ink">Ajout en lot</p>
            <p className="mt-0.5 text-[11px] font-medium text-ink-3">
              Renseignez plusieurs villas d'un coup, ou basculez sur « Import Excel ».
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr_auto] gap-2 text-[10px] font-bold uppercase tracking-[.05em] text-ink-3">
              <span>N° villa *</span>
              <span>Rue</span>
              <span>Description</span>
              <span />
            </div>
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_1.5fr_auto] gap-2 items-center">
                  <input
                    value={row.numero}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], numero: e.target.value };
                      setRows(next);
                    }}
                    placeholder="15"
                    aria-label="Numéro de villa"
                    className={inputCls}
                  />
                  <input
                    value={row.rue}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], rue: e.target.value };
                      setRows(next);
                    }}
                    placeholder="Rue des Palmiers"
                    aria-label="Rue"
                    className={inputCls}
                  />
                  <input
                    value={row.description}
                    onChange={(e) => {
                      const next = [...rows];
                      next[i] = { ...next[i], description: e.target.value };
                      setRows(next);
                    }}
                    placeholder="Proche portail"
                    aria-label="Description"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [emptyRow()])}
                    aria-label="Supprimer la ligne"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-3"
                  >
                    <Trash2 size={15} strokeWidth={1.7} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRows([...rows, emptyRow()])}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-light px-3 py-2 text-[12px] font-bold text-primary"
          >
            <Plus size={14} strokeWidth={2} /> Ajouter une ligne
          </button>

          {formError && <p className="text-xs font-semibold text-danger">{formError}</p>}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            onClick={submitForm}
            disabled={!rows.some((r) => r.numero.trim())}
            className="rounded-md py-4 text-[15px]"
          >
            {submitting ? "Enregistrement…" : `Ajouter ${validFormRows().filter((r) => r.numero).length || ""} villa${validFormRows().filter((r) => r.numero).length > 1 ? "s" : ""}`}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-emerald-soft border border-border p-3">
            <p className="text-[12px] font-bold text-ink">Import en masse</p>
            <p className="mt-0.5 text-[11px] font-medium text-ink-3">
              Téléchargez le modèle Excel, remplissez les lignes puis importez-le.
              Les lignes erronées sont listées avant l'envoi.
            </p>
          </div>

          <Button
            variant="secondary"
            className="rounded-md"
            onClick={downloadTemplate}
          >
            <Download size={15} strokeWidth={1.8} /> Télécharger le modèle
          </Button>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-[1.5px] border-dashed border-border bg-surface-2 py-5 text-left">
            <Upload size={20} strokeWidth={1.7} className="text-primary" />
            <span className="text-[13px] font-bold text-ink">
              {fileName || "Choisir un fichier .xlsx"}
            </span>
            <span className="text-[11px] font-medium text-ink-3">Max 1000 lignes · N°, Rue, Description</span>
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                onFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>

          {importError && <p className="text-xs font-semibold text-danger">{importError}</p>}

          {parsed.length > 0 && (
            <div className="overflow-hidden rounded-md border border-border">
              <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2">
                <span className="text-[12px] font-bold text-ink">
                  {fileName} · {parsed.filter((p) => !p.erreur).length} valide{parsed.filter((p) => !p.erreur).length > 1 ? "s" : ""}
                  {parsed.some((p) => p.erreur) ? ` · ${parsed.filter((p) => p.erreur).length} erreur${parsed.filter((p) => p.erreur).length > 1 ? "s" : ""}` : ""}
                </span>
                <button
                  type="button"
                  onClick={resetImport}
                  className="text-[11px] font-bold text-danger"
                >
                  Réinitialiser
                </button>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {parsed.map((p) => (
                  <div key={p.index} className="flex items-start gap-2 px-3 py-2">
                    {p.erreur ? (
                      <CircleAlert size={14} strokeWidth={1.7} className="shrink-0 text-danger" />
                    ) : (
                      <CheckCircle2 size={14} strokeWidth={1.7} className="shrink-0 text-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-[12px] font-bold text-ink">
                        {p.erreur ? `Ligne ${p.ligne}` : `Villa ${p.numero}`}
                      </span>
                      <span className="text-[11px] font-medium text-ink-3">
                        {p.erreur
                          ? ` — ${p.erreur}`
                          : ` · ${[p.rue, p.description].filter(Boolean).join(" · ") || "sans précision"}`}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-ink-3">L{p.ligne}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            loading={submitting}
            onClick={submitImport}
            disabled={!parsed.some((p) => !p.erreur)}
            className="rounded-md py-4 text-[15px]"
          >
            {submitting ? "Enregistrement…" : "Importer les villas"}
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}

function CreateCiteSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      citeApi.create({
        nom: nom.trim(),
        ville: ville.trim() || undefined,
        pays: pays.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
      setNom("");
      setVille("");
      setPays("");
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Création impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouvelle cité">
      <div className="flex flex-col gap-4">
        <Field label="Nom de la cité">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex : Citadelle Le Plateau"
            className={inputCls}
          />
        </Field>
        <Field label="Ville (optionnel)">
          <input
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Abidjan — Plateau"
            className={inputCls}
          />
        </Field>
        <Field label="Pays (optionnel)">
          <input
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            placeholder="Côte d'Ivoire"
            className={inputCls}
          />
        </Field>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          onClick={() => create.mutate()}
          disabled={nom.trim().length < 2}
          className="rounded-md py-4 text-[15px]"
        >
          Créer la cité
        </Button>
        <button onClick={onClose} className="w-full py-2 text-sm font-semibold text-ink-3">
          Annuler
        </button>
      </div>
    </BottomSheet>
  );
}

const inputCls =
  "w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-xs font-bold tracking-[.02em] text-ink-2">{label}</label>
      {children}
    </div>
  );
}
