"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Download,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { citeApi } from "@/lib/api/cite";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { userApi } from "@/lib/api/user";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";

export const inputCls =
  "w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none placeholder:text-ink-3 focus:border-accent";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className="text-xs font-bold tracking-[.02em] text-ink-2">{label}</label>
      {children}
    </div>
  );
}

export function CreateSyndicSheet({
  cite,
  onClose,
}: {
  cite: { id: string; nom: string } | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
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
      qc.invalidateQueries({ queryKey: ["sa", "users", cite?.id] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
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
            className={inputCls}
          />
          <input
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            placeholder="Nom"
            className={inputCls}
          />
        </div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Email"
          className={inputCls}
        />
        <input
          value={form.telephone}
          onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
          placeholder="Téléphone (optionnel)"
          className={inputCls}
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

export function AddVillaSheet({
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
        qc.invalidateQueries({ queryKey: ["sa", "villas", cite!.id] });
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
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-light px-3 py-2 text-[12px] font-bold text-accent"
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
            <Upload size={20} strokeWidth={1.7} className="text-accent" />
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
                      <CheckCircle2 size={14} strokeWidth={1.7} className="shrink-0 text-accent" />
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

/** Crée le sous-compte Paystack de la cité (backend → Paystack → retour code). */
export function CreateSubaccountSheet({
  cite,
  onClose,
  onCreated,
}: {
  cite: { id: string; nom: string } | null;
  onClose: () => void;
  onCreated?: (r: {
    paystack_subaccount_code?: string;
    paystack_subaccount_mode?: "SIMPLE" | "SPLIT";
    paystack_subaccount_split?: number;
  }) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    business_name: "",
    settlement_bank: "",
    account_number: "",
    // Rémunération plateforme : commission OU split, jamais les deux.
    revenue: "commission" as "commission" | "split",
    percentage_charge: "2",
    split_share: "90",
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialise le formulaire à chaque ouverture (nouvelle cité / re-création).
  useEffect(() => {
    if (cite) {
      setForm({
        business_name: cite.nom,
        settlement_bank: "",
        account_number: "",
        revenue: "commission",
        percentage_charge: "2",
        split_share: "90",
      });
      setDone(false);
      setError(null);
    }
  }, [cite?.id, cite?.nom]);

  const create = useMutation({
    mutationFn: () =>
      citeApi.createSubaccount(cite!.id, {
        business_name: form.business_name.trim(),
        settlement_bank: form.settlement_bank.trim(),
        account_number: form.account_number.trim(),
        // En mode split la commission est forcée à 0 (anti-double prélèvement).
        percentage_charge:
          form.revenue === "commission"
            ? Number(form.percentage_charge)
            : 0,
        paystack_subaccount_mode: form.revenue === "split" ? "SPLIT" : "SIMPLE",
        paystack_subaccount_split:
          form.revenue === "split" ? Number(form.split_share) : undefined,
      }),
    onSuccess: (r) => {
      setDone(true);
      setError(null);
      qc.invalidateQueries({ queryKey: ["sa", "config", cite!.id] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
      onCreated?.({
        paystack_subaccount_code: r.paystack_subaccount_code,
        paystack_subaccount_mode: r.paystack_subaccount_mode,
        paystack_subaccount_split: r.paystack_subaccount_split,
      });
    },
    onError: (e) => setError(apiErrorMessage(e, "Création du sous-compte impossible")),
  });

  const valid =
    form.business_name.trim().length >= 2 &&
    form.settlement_bank.trim().length > 0 &&
    form.account_number.trim().length >= 6;

  return (
    <BottomSheet
      open={!!cite}
      onClose={onClose}
      title={`Créer le sous-compte Paystack — ${cite?.nom ?? ""}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 rounded-md bg-primary-light p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary text-white">
            <CreditCard size={16} strokeWidth={1.7} />
          </span>
          <p className="text-[12px] font-medium leading-relaxed text-accent">
            Paystack crée le sous-compte et nous renvoie son code, enregistré
            automatiquement pour encaisser les cotisations de cette cité.
          </p>
        </div>

        {done && (
          <p className="flex items-center gap-1.5 text-[12px] font-bold text-emerald">
            <Check size={14} strokeWidth={2} /> Sous-compte créé et enregistré ✓
          </p>
        )}

        <Field label="Nom commercial">
          <input
            value={form.business_name}
            onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
            placeholder="Résidence Synacassy 1"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-[1fr_1.3fr] gap-3">
          <Field label="Code banque">
            <input
              value={form.settlement_bank}
              onChange={(e) => setForm((f) => ({ ...f, settlement_bank: e.target.value }))}
              placeholder="044"
              className={inputCls}
            />
          </Field>
          <Field label="N° de compte">
            <input
              value={form.account_number}
              onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
              placeholder="0123456789"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Rémunération plateforme — un seul mode, jamais cumulé */}
        <div className="rounded-md border border-border bg-surface p-3">
          <label className="text-xs font-bold tracking-[.02em] text-ink-2">
            Rémunération de la plateforme
          </label>
          <div className="mt-1.5 flex gap-2">
            {(
              [
                { key: "commission", label: "Commission %" },
                { key: "split", label: "Split par paiement" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                aria-pressed={form.revenue === opt.key}
                onClick={() => setForm((f) => ({ ...f, revenue: opt.key }))}
                className={cn(
                  "flex-1 rounded-md border py-2.5 text-[12px] font-bold",
                  form.revenue === opt.key
                    ? "border-transparent bg-primary text-white shadow-btn"
                    : "border-border bg-surface-2 text-ink-3",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-medium leading-relaxed text-ink-3">
            Commission (%) ou split par transaction — l'un ou l'autre, jamais les
            deux (évite le double prélèvement).
          </p>
        </div>

        {form.revenue === "commission" ? (
          <Field label="Commission plateforme (%)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step="0.1"
              value={form.percentage_charge}
              onChange={(e) =>
                setForm((f) => ({ ...f, percentage_charge: e.target.value }))
              }
              placeholder="2"
              className={inputCls}
            />
            <p className="text-[11px] font-medium leading-relaxed text-ink-3">
              Prélevée par Paystack sur chaque paiement encaissé par la cité.
              Le règlement reste en mode simple (100 % en caisse, moins cette
              commission).
            </p>
          </Field>
        ) : (
          <Field label="Part revenant à la cité par paiement (%)">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              value={form.split_share}
              onChange={(e) =>
                setForm((f) => ({ ...f, split_share: e.target.value }))
              }
              placeholder="90"
              className={inputCls}
            />
            <p className="text-[11px] font-medium leading-relaxed text-ink-3">
              Le reste est versé instantanément au compte plateforme, à chaque
              transaction. Commission du sous-compte forcée à 0.
            </p>
          </Field>
        )}

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          disabled={!valid || create.isPending}
          onClick={() => create.mutate()}
          className="rounded-md py-4 text-[15px]"
        >
          {create.isPending ? "Création…" : "Créer le sous-compte"}
        </Button>
        {done && (
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-semibold text-ink-3"
          >
            Fermer
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

/** Modifie les informations de la cité : nom, ville, pays, villas attendues. */
export function EditCiteSheet({
  cite,
  onClose,
}: {
  cite: {
    id: string;
    nom: string;
    ville?: string | null;
    pays?: string | null;
    nombre_villas_attendu?: number | null;
  } | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nom: "",
    ville: "",
    pays: "",
    nombre_villas_attendu: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cite) {
      setForm({
        nom: cite.nom ?? "",
        ville: cite.ville ?? "",
        pays: cite.pays ?? "",
        nombre_villas_attendu:
          cite.nombre_villas_attendu != null
            ? String(cite.nombre_villas_attendu)
            : "",
      });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cite?.id]);

  const save = useMutation({
    mutationFn: () =>
      citeApi.update(cite!.id, {
        nom: form.nom.trim(),
        ville: form.ville.trim(),
        pays: form.pays.trim(),
        ...(form.nombre_villas_attendu.trim()
          ? { nombre_villas_attendu: Number(form.nombre_villas_attendu) }
          : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
      qc.invalidateQueries({ queryKey: ["sa", "config", cite!.id] });
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Modification impossible")),
  });

  return (
    <BottomSheet
      open={!!cite}
      onClose={onClose}
      title={`Modifier la cité — ${cite?.nom ?? ""}`}
    >
      <div className="flex flex-col gap-4">
        <Field label="Nom de la cité">
          <input
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            placeholder="Résidence Synacassy 1"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ville">
            <input
              value={form.ville}
              onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
              placeholder="Abidjan — Plateau"
              className={inputCls}
            />
          </Field>
          <Field label="Pays">
            <input
              value={form.pays}
              onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))}
              placeholder="Côte d'Ivoire"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Nombre de villas attendu">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={form.nombre_villas_attendu}
            onChange={(e) =>
              setForm((f) => ({ ...f, nombre_villas_attendu: e.target.value }))
            }
            placeholder="143"
            className={inputCls}
          />
          <p className="text-[11px] font-medium leading-relaxed text-ink-3">
            Base du taux de recouvrement (villas à jour).
          </p>
        </Field>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={save.isPending}
          disabled={!form.nom.trim() || save.isPending}
          onClick={() => save.mutate()}
          className="rounded-md py-4 text-[15px]"
        >
          Enregistrer
        </Button>
      </div>
    </BottomSheet>
  );
}