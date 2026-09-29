"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Copy,
  CreditCard,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { citeApi } from "@/lib/api/cite";
import { CreateSubaccountSheet } from "@/components/features/super-admin/CiteSheets";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { CiteConfiguration, OccupStatut, SaVilla } from "@/types/cite.types";
import type { User } from "@/types/user.types";

type Tab = "villas" | "staff" | "config";

const OCC_TONES: Record<SaVilla["statut"], { label: string; cls: string }> = {
  libre: { label: "Libre", cls: "bg-emerald-soft text-emerald" },
  occupee: { label: "Occupée", cls: "bg-primary-light text-accent" },
  en_attente: { label: "En attente", cls: "bg-gold-soft text-gold" },
};

const ROLE_TONES: Record<string, string> = {
  SYNDIC: "bg-gold-soft text-gold",
  CHEF_SECURITE: "bg-danger-soft text-danger",
  HABITANT: "bg-primary-light text-accent",
};

const PAGE_SIZE = 25;

function Tabs({ value, setValue }: { value: Tab; setValue: (t: Tab) => void }) {
  const items: { key: Tab; label: string }[] = [
    { key: "villas", label: "Villas" },
    { key: "staff", label: "Comptes" },
    { key: "config", label: "Configuration" },
  ];
  return (
    <div className="flex gap-1.5 rounded-pill bg-surface-2 p-1">
      {items.map((t) => (
        <button
          key={t.key}
          type="button"
          aria-pressed={value === t.key}
          onClick={() => setValue(t.key)}
          className={cn(
            "flex-1 rounded-pill px-3 py-1.5 text-[12px] font-bold transition-colors",
            value === t.key
              ? "bg-primary text-white shadow-btn"
              : "text-ink-3 hover:text-ink-2",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Island({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md bg-surface p-4 shadow-card">
      <div className="text-[13px] font-extrabold tracking-[-.2px] text-ink">
        {title}
      </div>
      {hint && (
        <div className="mt-0.5 text-[11px] font-medium leading-relaxed text-ink-3">
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

function Chip({
  active,
  label,
  cls,
  onClick,
}: {
  active: boolean;
  label: string;
  cls: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-bold transition-colors",
        active
          ? "border border-accent bg-primary-light text-accent"
          : cn("bg-surface-2 text-ink-3 hover:text-ink-2", cls),
      )}
    >
      {label}
    </button>
  );
}

export function CiteManager({
  citeId,
  citeNom,
  onAddVilla,
  onAddSyndic,
}: {
  citeId: string;
  citeNom: string;
  onAddVilla: () => void;
  onAddSyndic: () => void;
}) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("villas");

  const [editVilla, setEditVilla] = useState<SaVilla | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaVilla | null>(null);

  const [vq, setVq] = useState("");
  const [vStatut, setVStatut] = useState<"*" | OccupStatut>("*");
  const [vPage, setVPage] = useState(1);

  const villasKey = ["sa", "villas", citeId] as const;
  const usersKey = ["sa", "users", citeId] as const;
  const configKey = ["sa", "config", citeId] as const;

  const villas = useQuery({
    queryKey: villasKey,
    queryFn: () => citeApi.villas(citeId),
    enabled: tab === "villas",
  });
  const users = useQuery({
    queryKey: usersKey,
    queryFn: () => citeApi.users(citeId, "SYNDIC"),
    enabled: tab === "staff",
  });
  const config = useQuery({
    queryKey: configKey,
    queryFn: () => citeApi.configuration(citeId),
    enabled: tab === "config",
  });

  const allVillas = villas.data ?? [];
  const vNorm = vq.trim().toLowerCase();
  const visibleVillas = allVillas.filter(
    (v) =>
      (!vNorm ||
        v.numero.toLowerCase().includes(vNorm) ||
        (v.rue ?? "").toLowerCase().includes(vNorm)) &&
      (vStatut === "*" || v.statut === vStatut),
  );
  const vPages = Math.max(1, Math.ceil(visibleVillas.length / PAGE_SIZE));
  const vPageSafe = Math.min(vPage, vPages);
  const vRows = visibleVillas.slice(
    (vPageSafe - 1) * PAGE_SIZE,
    vPageSafe * PAGE_SIZE,
  );

  useEffect(() => setVPage(1), [vq, vStatut]);
  useEffect(() => {
    if (vPage > vPages) setVPage(vPages);
  }, [vPage, vPages]);

  const bake = () => {
    qc.invalidateQueries({ queryKey: ["sa", "villas", citeId] });
    qc.invalidateQueries({ queryKey: ["sa", "users", citeId] });
    qc.invalidateQueries({ queryKey: ["sa", "config", citeId] });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.cites() });
  };

  const toggleVilla = useMutation({
    mutationFn: (v: SaVilla) =>
      citeApi.updateVilla(citeId, v.id, { is_active: !v.is_active }),
    onSuccess: bake,
    onError: () => {},
  });

  const deleteVilla = useMutation({
    mutationFn: (v: SaVilla) => citeApi.deleteVilla(citeId, v.id),
    onSuccess: () => {
      bake();
      setDeleteTarget(null);
    },
    onError: () => {},
  });

  const toggleUser = useMutation({
    mutationFn: (u: User) =>
      u.is_active
        ? citeApi.deactivateUser(citeId, u.id)
        : citeApi.activateUser(citeId, u.id),
    onSuccess: bake,
    onError: () => {},
  });

  return (
    <div className="mt-3 rounded-md bg-bg p-3.5">
      <Tabs value={tab} setValue={setTab} />

      {tab === "villas" && (
        <div className="mt-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-ink-3">
              {allVillas.length} villa{allVillas.length > 1 ? "s" : ""}
              {allVillas.length !== visibleVillas.length &&
                ` · ${visibleVillas.length} affiché${visibleVillas.length > 1 ? "s" : ""}`}
            </span>
            <button
              type="button"
              onClick={onAddVilla}
              className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2.5 py-1.5 text-[11px] font-bold text-accent"
            >
              <Plus size={13} strokeWidth={2} /> Ajouter
            </button>
          </div>

          <div className="relative mt-2">
            <Search
              size={14}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              type="search"
              value={vq}
              onChange={(e) => setVq(e.target.value)}
              placeholder={`Rechercher une villa (n°, rue)…`}
              aria-label="Rechercher une villa"
              className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-2 pl-7 pr-2.5 text-[12px] text-ink outline-none placeholder:text-ink-3 focus:border-accent"
            />
          </div>

          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
            <Chip
              active={vStatut === "*"}
              label={`Toutes · ${allVillas.length}`}
              cls="bg-surface-2 text-ink-3"
              onClick={() => setVStatut("*")}
            />
            {(
              [
                ["libre", "Libres"],
                ["en_attente", "En attente"],
                ["occupee", "Occupées"],
              ] as const
            ).map(([key, label]) => {
              const tone = OCC_TONES[key];
              return (
                <Chip
                  key={key}
                  active={vStatut === key}
                  label={`${label} · ${allVillas.filter((v) => v.statut === key).length}`}
                  cls={tone.cls}
                  onClick={() => setVStatut(key)}
                />
              );
            })}
          </div>

          {villas.isLoading ? (
            <div className="mt-2 flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-11 rounded-md" />
              ))}
            </div>
          ) : allVillas.length === 0 ? (
            <p className="mt-2 rounded-md border border-dashed border-border bg-surface px-3 py-3 text-[11px] font-medium text-ink-3">
              Aucune villa pour le moment — ajoutez la première.
            </p>
          ) : vRows.length === 0 ? (
            <div className="mt-2 rounded-md border border-dashed border-border bg-surface px-3 py-3 text-[11px] font-medium text-ink-3">
              Aucune villa ne correspond à la recherche.
              <button
                type="button"
                onClick={() => {
                  setVq("");
                  setVStatut("*");
                }}
                className="ml-1 font-bold text-accent underline"
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2 overflow-hidden rounded-md border border-border bg-surface">
              {vRows.map((v) => {
                const tone = OCC_TONES[v.statut] ?? OCC_TONES.libre;
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-light text-[11px] font-extrabold text-accent">
                      {v.numero.length > 2 ? v.numero.slice(0, 2) : v.numero}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-bold text-ink">
                        Villa {v.numero}
                        {!v.is_active && (
                          <span className="ml-1 text-[10px] font-bold text-ink-3">
                            · Désactivée
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[10px] font-medium text-ink-3">
                        {v.rue || "sans rue"}
                        {v.nb_occupants_confirmes > 0 &&
                          ` · ${v.nb_occupants_confirmes} occupant${v.nb_occupants_confirmes > 1 ? "s" : ""}`}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-pill px-2 py-0.5 text-[10px] font-bold",
                        tone.cls,
                      )}
                    >
                      {tone.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditVilla(v)}
                      aria-label={`Modifier la villa ${v.numero}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-3 hover:text-accent"
                    >
                      <Pencil size={13} strokeWidth={1.7} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(v)}
                      aria-label={`Supprimer la villa ${v.numero}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-danger"
                    >
                      <Trash2 size={13} strokeWidth={1.7} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {allVillas.length > 0 && vRows.length > 0 && vPages > 1 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-3">
                {((vPageSafe - 1) * PAGE_SIZE) + 1}–
                {Math.min(vPageSafe * PAGE_SIZE, visibleVillas.length)} sur{" "}
                {visibleVillas.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setVPage(Math.max(1, vPageSafe - 1))}
                  disabled={vPageSafe <= 1}
                  aria-label="Page précédente"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-3 disabled:opacity-35"
                >
                  <ChevronLeft size={13} strokeWidth={1.7} />
                </button>
                <span className="text-[11px] font-bold text-ink-2">
                  {vPageSafe}/{vPages}
                </span>
                <button
                  type="button"
                  onClick={() => setVPage(Math.min(vPages, vPageSafe + 1))}
                  disabled={vPageSafe >= vPages}
                  aria-label="Page suivante"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-3 disabled:opacity-35"
                >
                  <ChevronRight size={13} strokeWidth={1.7} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "staff" && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-ink-3">
              {users.data?.length ?? "…"} compte
              {(users.data?.length ?? 0) > 1 ? "s" : ""} syndic
            </span>
            <button
              type="button"
              onClick={onAddSyndic}
              className="inline-flex items-center gap-1 rounded-md bg-primary-light px-2.5 py-1.5 text-[11px] font-bold text-accent"
            >
              <Plus size={13} strokeWidth={2} /> Créer un syndic
            </button>
          </div>

          {users.isLoading ? (
            <div className="mt-2 flex flex-col gap-2">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : users.data?.length ? (
            <div className="mt-2 flex flex-col gap-2 overflow-hidden rounded-md border border-border bg-surface">
              {users.data.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0"
                >
                  <Avatar
                    name={`${u.prenom} ${u.nom}`}
                    size={32}
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[12px] font-bold text-ink">
                        {u.prenom} {u.nom}
                      </span>
                      {(u.roles ?? []).slice(0, 2).map((r) => (
                        <span
                          key={r.code}
                          className={cn(
                            "shrink-0 rounded-pill px-1.5 text-[9px] font-bold",
                            ROLE_TONES[r.code] ?? "bg-surface-2 text-ink-3",
                          )}
                        >
                          {r.libelle ?? r.code}
                        </span>
                      ))}
                    </div>
                    <div className="truncate text-[10px] font-medium text-ink-3">
                      {u.email ?? ""} ·{" "}
                      <span
                        className={cn(
                          u.is_active ? "text-emerald" : "text-ink-3",
                        )}
                      >
                        {u.is_active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={u.is_active !== false}
                    onChange={() => toggleUser.mutate(u)}
                    aria-label={`${u.is_active ? "Désactiver" : "Activer"} ${u.prenom} ${u.nom}`}
                    className="h-[22px] w-10 shrink-0 accent-primary"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-md border border-dashed border-border bg-surface px-3 py-3 text-[11px] font-medium text-ink-3">
              Aucun compte syndic — créez le premier pour cette cité.
            </p>
          )}
        </div>
      )}

      {tab === "config" && (
        <ConfigTab
          citeId={citeId}
          citeNom={citeNom}
          key={config.data?.id ?? "config"}
          config={config.data}
          isLoading={config.isLoading}
          onSaved={bake}
        />
      )}

      {editVilla && (
        <EditVillaSheet
          open={!!editVilla}
          onClose={() => setEditVilla(null)}
          citeId={citeId}
          villa={editVilla}
          onSaved={bake}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteVilla.mutate(deleteTarget)}
        title="Supprimer la villa"
        message={`Villa ${deleteTarget?.numero ?? ""} · ${deleteTarget?.rue ?? ""}. Cette action détache les occupants actuels et est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteVilla.isPending}
      />
    </div>
  );
}

function EditVillaSheet({
  open,
  onClose,
  citeId,
  villa,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  citeId: string;
  villa: SaVilla;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    numero: villa.numero,
    rue: villa.rue ?? "",
    description: villa.description ?? "",
    is_active: villa.is_active,
  });
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      citeApi.updateVilla(citeId, villa.id, {
        numero: form.numero.trim(),
        rue: form.rue.trim() || undefined,
        description: form.description.trim() || undefined,
        is_active: form.is_active,
      }),
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Modification impossible")),
  });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={`Modifier la villa ${villa.numero}`}
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Numéro de villa"
          value={form.numero}
          onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
          placeholder="15bis"
        />
        <Input
          label="Rue"
          value={form.rue}
          onChange={(e) => setForm((f) => ({ ...f, rue: e.target.value }))}
          placeholder="Rue des Palmiers"
        />
        <Input
          label="Description (optionnel)"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Proche du portail principal"
        />
        <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-ink-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
            className="h-4 w-4 accent-primary"
          />
          Villa active
        </label>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={save.isPending}
          disabled={!form.numero.trim()}
          onClick={() => save.mutate()}
          className="rounded-md py-4 text-[15px]"
        >
          Enregistrer
        </Button>
      </div>
    </BottomSheet>
  );
}

function ConfigTab({
  citeId,
  citeNom,
  config,
  isLoading,
  onSaved,
}: {
  citeId: string;
  citeNom: string;
  config?: CiteConfiguration | null;
  isLoading: boolean;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<{
    cotisation_mensuelle: string;
    nombre_villas_attendu: string;
    paystack_subaccount_code: string;
    paystack_subaccount_mode: "SIMPLE" | "SPLIT";
    paystack_subaccount_split: string;
  }>({
    cotisation_mensuelle: config?.cotisation_mensuelle?.toString() ?? "",
    nombre_villas_attendu: config?.nombre_villas_attendu?.toString() ?? "",
    paystack_subaccount_code: "",
    paystack_subaccount_mode: config?.paystack_subaccount_mode ?? "SIMPLE",
    paystack_subaccount_split: config?.paystack_subaccount_split?.toString() ?? "100",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedCode, setStoredCode] = useState<string>(
    config?.paystack_subaccount_code ?? "",
  );
  const [subOpen, setSubOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Commission du sous-compte (si le backend la renvoie) : elle s'applique à
  // tout → on bloque le mode SPLIT pour éviter le double prélèvement.
  const commission = config?.percentage_charge ? Number(config.percentage_charge) : 0;
  const splitBlocked = commission > 0;

  const copyCode = async () => {
    if (!storedCode) return;
    try {
      await navigator.clipboard.writeText(storedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const save = useMutation({
    mutationFn: () =>
      citeApi.updateConfiguration(citeId, {
        cotisation_mensuelle: parseInt(form.cotisation_mensuelle, 10),
        nombre_villas_attendu: parseInt(form.nombre_villas_attendu, 10),
        paystack_subaccount_code:
          form.paystack_subaccount_code.trim() || undefined,
        paystack_subaccount_mode: form.paystack_subaccount_mode,
        paystack_subaccount_split: parseInt(form.paystack_subaccount_split, 10),
      }),
    onSuccess: () => {
      setSaved(true);
      setForm((f) => ({ ...f, paystack_subaccount_code: "" }));
      onSaved();
    },
    onError: (e) => setError(apiErrorMessage(e, "Enregistrement impossible")),
  });

  if (isLoading) {
    return (
      <div className="mt-2.5 flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-11 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-2.5 flex w-full max-w-md flex-col gap-3">
      <Input
        label="Cotisation mensuelle (FCFA)"
        type="number"
        min={0}
        value={form.cotisation_mensuelle}
        onChange={(e) =>
          setForm((f) => ({ ...f, cotisation_mensuelle: e.target.value }))
        }
        placeholder="25 000"
      />
      <Input
        label="Nombre de villas attendu"
        type="number"
        min={0}
        value={form.nombre_villas_attendu}
        onChange={(e) =>
          setForm((f) => ({ ...f, nombre_villas_attendu: e.target.value }))
        }
        hint="Base du taux de recouvrement (villas à jour)."
      />

      {/* Sous-compte Paystack — création via l'API, sans saisie manuelle */}
      <div className="rounded-md border border-border bg-surface p-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary-light text-accent">
            <CreditCard size={18} strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-extrabold tracking-[-.2px] text-ink">
              Sous-compte Paystack
            </div>
            <div className="text-[11px] font-medium text-ink-3">
              Encaissement des cotisations de la cité
            </div>
          </div>
          {storedCode && (
            <span className="rounded-pill bg-emerald-soft px-2 py-0.5 text-[10px] font-bold text-emerald">
              Connecté
            </span>
          )}
        </div>

        {storedCode ? (
          <>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-surface-2 p-2.5">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[.04em] text-ink-3">
                Code sous-compte
              </div>
              <div className="mt-0.5 font-mono text-[12px] font-bold text-ink">
                {storedCode}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={copyCode}
                aria-label="Copier le code"
                title="Copier le code"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-3 hover:text-accent"
              >
                {copied ? (
                  <Check size={13} strokeWidth={2} className="text-emerald" />
                ) : (
                  <Copy size={13} strokeWidth={1.7} />
                )}
              </button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSubOpen(true)}
                className="rounded-md"
              >
                <RefreshCw size={13} strokeWidth={1.7} /> Remplacer
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-ink-2">
            <Percent size={13} strokeWidth={1.7} className="shrink-0 text-accent" />
            Rémunération :{" "}
            <span className="font-bold text-ink">
              {form.paystack_subaccount_mode === "SPLIT"
                ? `Split — ${form.paystack_subaccount_split || "?"} % par paiement à la cité`
                : commission > 0
                  ? `Commission ${commission} % sur chaque paiement`
                  : "Tous les paiements à la cité"}
            </span>
          </div>

          {splitBlocked && form.paystack_subaccount_mode === "SPLIT" && (
            <p className="mt-1.5 flex items-start gap-1.5 rounded-md border border-danger bg-danger-soft px-2.5 py-2 text-[11px] font-bold text-danger">
              <CircleAlert size={13} strokeWidth={1.8} className="shrink-0" />
              Commission ({commission} %) et split actifs : configuration
              incohérente. Remplacez le sous-compte (commission à 0) pour
              appliquer le split.
            </p>
          )}
          </>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-border bg-surface-2 p-3">
            <p className="text-[12px] font-bold text-ink">
              Aucun sous-compte configuré
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-ink-3">
              Renseignez le compte de règlement : Paystack crée le sous-compte et
              le code est enregistré automatiquement.
            </p>
            <Button
              size="sm"
              onClick={() => setSubOpen(true)}
              className="mt-2.5 rounded-md"
            >
              <Plus size={14} strokeWidth={2} /> Créer le sous-compte
            </Button>
          </div>
        )}
      </div>


      {/* Saisie manuelle — cas d'urgence / compte existant */}
      <details className="rounded-md border border-border bg-surface p-3 text-[11px] text-ink-3">
        <summary className="cursor-pointer font-bold text-ink-2">
          Paramètres avancés — saisir un code existant
        </summary>
        <Input
          label="Code subaccount Paystack"
          type="text"
          autoComplete="off"
          value={form.paystack_subaccount_code}
          onChange={(e) =>
            setForm((f) => ({ ...f, paystack_subaccount_code: e.target.value }))
          }
          placeholder={
            config?.paystack_subaccount_code
              ? `Actuel : ${config.paystack_subaccount_code}`
              : "SUB_XXXX"
          }
          hint="Laisser vide pour conserver le code actuel."
        />
      </details>

      {saved && (
        <p className="text-[12px] font-bold text-emerald">
          Configuration enregistrée.
        </p>
      )}
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}

      <Button
        fullWidth
        size="lg"
        loading={save.isPending}
        onClick={() => {
          setSaved(false);
          save.mutate();
        }}
        className="rounded-md py-3.5 text-[14px]"
      >
        Enregistrer la configuration
      </Button>

      <CreateSubaccountSheet
        cite={subOpen ? { id: citeId, nom: citeNom } : null}
        onClose={() => setSubOpen(false)}
        onCreated={(r) => {
          const mode = r.paystack_subaccount_mode;
          if (r.paystack_subaccount_code) setStoredCode(r.paystack_subaccount_code);
          if (mode) {
            setForm((f) => ({
              ...f,
              paystack_subaccount_mode: mode,
              paystack_subaccount_split:
                mode === "SPLIT" && r.paystack_subaccount_split
                  ? String(r.paystack_subaccount_split)
                  : f.paystack_subaccount_split,
            }));
          }
        }}
      />
    </div>
  );
}