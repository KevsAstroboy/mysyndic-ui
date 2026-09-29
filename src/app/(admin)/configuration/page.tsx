"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Check, ChevronLeft, ChevronRight, CreditCard, Phone, Settings } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { configurationApi } from "@/lib/api/configuration";
import type { CiteConfiguration } from "@/lib/api/configuration";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ConfigurationPage() {
  const config = useQuery({ queryKey: ["configuration"], queryFn: configurationApi.get });

  return (
    <>
      <PageHeader
        title="Configuration"
        subtitle="Paramètres de la cité"
      />

      <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-5 md:px-8">
        <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
          Configuration
        </h1>

        {config.isLoading ? (
          <div className="mt-5 flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))}
          </div>
        ) : (
          <ConfigForm initial={config.data} />
        )}
      </div>
    </>
  );
}

/** Assistant en étapes — le formulaire plat devenait trop long.
 *  Répartition : le super admin gère Paystack + le plan de la cité
 *  (villas attendu) ; le syndic ne touche qu'à la cotisation & contacts. */
function ConfigForm({ initial }: { initial?: CiteConfiguration | null }) {
  const { user, isRole } = useAuth();
  const isSa = isRole("SUPER_ADMIN");
  const firstCode = initial?.paystack_subaccount_code ?? "";

  // Syndic : 1 seule étape (pas Paystack, pas le plan de la cité).
  const stepLabels = isSa
    ? ["Cotisation & contacts", "Paiement (Paystack)", "Cité & plan"]
    : ["Cotisation & contacts"];
  const maxStep = stepLabels.length - 1;
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    cotisation_mensuelle: initial?.cotisation_mensuelle ? String(initial.cotisation_mensuelle) : "",
    lien_wave: (initial?.lien_wave as string) ?? "",
    telephone_syndic: (initial?.telephone_syndic as string) ?? "",
    telephone_urgence: (initial?.telephone_urgence as string) ?? "",
    paystack_subaccount_code: firstCode,
    paystack_subaccount_mode: (initial?.paystack_subaccount_mode as string) ?? "SIMPLE",
    paystack_subaccount_split: initial?.paystack_subaccount_split
      ? String(initial.paystack_subaccount_split)
      : "",
    nombre_villas_attendu: initial?.nombre_villas_attendu
      ? String(initial.nombre_villas_attendu)
      : "",
  });

  // Création du sous-compte Paystack (super admin uniquement)
  const [saForm, setSaForm] = useState({
    business_name: "",
    settlement_bank: "",
    account_number: "",
    percentage_charge: "0",
  });
  const [subCreated, setSubCreated] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const createSub = useMutation({
    mutationFn: () =>
      configurationApi.createSubaccount({
        business_name: saForm.business_name,
        settlement_bank: saForm.settlement_bank,
        account_number: saForm.account_number,
        percentage_charge: saForm.percentage_charge ? Number(saForm.percentage_charge) : 0,
        primary_contact_email: (user?.email as string | undefined) ?? undefined,
      }),
    onSuccess: (r) => {
      // Le code retourné est masqué côté serveur — on veut TOUJOURS le
      // dernier vrai code, mais le front ne le reçoit pas : on signale le
      // succès et on laisse le champ tel quel (le backend a persisté).
      setForm((f) => ({ ...f, paystack_subaccount_code: r.paystack_subaccount_code }));
      setSubCreated(true);
      setSubError(null);
    },
    onError: (e) => {
      setSubCreated(false);
      setSubError(apiErrorMessage(e, "Création du sous-compte impossible"));
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const save = useMutation({
    mutationFn: () =>
      configurationApi.update({
        cotisation_mensuelle: form.cotisation_mensuelle
          ? Number(form.cotisation_mensuelle)
          : undefined,
        lien_wave: form.lien_wave || undefined,
        telephone_syndic: form.telephone_syndic || undefined,
        telephone_urgence: form.telephone_urgence || undefined,
        // Ne renvoie JAMAIS le code masqué tel quel (il remplacerait le vrai).
        paystack_subaccount_code:
          form.paystack_subaccount_code && form.paystack_subaccount_code !== firstCode
            ? form.paystack_subaccount_code
            : undefined,
        paystack_subaccount_mode: form.paystack_subaccount_mode as "SIMPLE" | "SPLIT",
        paystack_subaccount_split: form.paystack_subaccount_split
          ? Number(form.paystack_subaccount_split)
          : undefined,
        nombre_villas_attendu: isSa && form.nombre_villas_attendu
          ? Number(form.nombre_villas_attendu)
          : undefined,
      }),
    onSuccess: () => {
      setSaved(true);
      setError(null);
    },
    onError: (e) => setError(apiErrorMessage(e, "Enregistrement impossible")),
  });

  // Localisation de l'étape
  const isPaystackStep = isSa && step === 1;
  const isFinalStep = step === maxStep;

  const next = () => {
    if (isFinalStep) {
      save.mutate();
      return;
    }
    setStep((s) => Math.min(maxStep, s + 1));
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="contents">
            {i > 0 && (
              <span className={cn("h-px w-5 shrink-0 rounded-pill", i <= step ? "bg-primary" : "bg-border")} />
            )}
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors",
                i === step
                  ? "bg-primary text-white"
                  : i < step
                    ? "bg-primary-light text-accent"
                    : "bg-surface-2 text-ink-3",
              )}
            >
              {i < step ? <Check size={13} strokeWidth={2} /> : <span>{i + 1}</span>}
              <span className="hidden md:inline">{label}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Étape 1 — cotisation & contacts */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-light text-accent">
                <CreditCard size={18} strokeWidth={1.7} />
              </span>
              <div>
                <div className="text-[15px] font-extrabold text-ink">Cotisation</div>
                <div className="text-[12px] font-medium text-ink-3">
                  Montant mensuel et canal de paiement
                </div>
              </div>
            </div>

            <Field label="Cotisation mensuelle (FCFA)">
              <input
                type="number"
                inputMode="numeric"
                value={form.cotisation_mensuelle}
                onChange={set("cotisation_mensuelle")}
                placeholder="25000"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            <Field label="Lien Wave">
              <input
                value={form.lien_wave}
                onChange={set("lien_wave")}
                placeholder="https://pay.wave.com/m/..."
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
          </div>

          <div className="rounded-md bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-light text-accent">
                <Phone size={18} strokeWidth={1.7} />
              </span>
              <div>
                <div className="text-[15px] font-extrabold text-ink">Contacts</div>
                <div className="text-[12px] font-medium text-ink-3">
                  Numéros affichés aux habitants
                </div>
              </div>
            </div>

            <Field label="Téléphone du syndic">
              <input
                value={form.telephone_syndic}
                onChange={set("telephone_syndic")}
                placeholder="+225 07 00 00 01"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            <Field label="Téléphone d'urgence">
              <input
                value={form.telephone_urgence}
                onChange={set("telephone_urgence")}
                placeholder="+225 07 00 00 02"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Étape 2 — Paystack (super admin uniquement) */}
      {isPaystackStep && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-light text-accent">
                <Settings size={18} strokeWidth={1.7} />
              </span>
              <div>
                <div className="text-[15px] font-extrabold text-ink">Sous-compte Paystack</div>
                <div className="text-[12px] font-medium text-ink-3">
                  Réservé au super admin — le syndic n'y a pas accès
                </div>
              </div>
            </div>

            <Field label="Code sous-compte">
              <input
                value={form.paystack_subaccount_code}
                onChange={set("paystack_subaccount_code")}
                placeholder="SUB_1234"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            <Field label="Mode">
              <Select
                value={form.paystack_subaccount_mode}
                onChange={(v) => {
                  setForm((f) => ({ ...f, paystack_subaccount_mode: v }));
                  setSaved(false);
                }}
                options={[
                  { value: "SIMPLE", label: "SIMPLE" },
                  { value: "SPLIT", label: "SPLIT" },
                ]}
              />
            </Field>
            <Field label="Split (%)">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                value={form.paystack_subaccount_split}
                onChange={set("paystack_subaccount_split")}
                placeholder="100"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
          </div>

          <div className="rounded-md bg-surface p-5 shadow-card">
            <div className="mb-4">
              <div className="text-[15px] font-extrabold text-ink">Créer le sous-compte</div>
              <div className="text-[12px] font-medium text-ink-3">
                Renseignez le compte de règlement de la cité ; Paystack crée le subaccount et on le stocke.
              </div>
            </div>

            <Field label="Nom commercial">
              <input
                value={saForm.business_name}
                onChange={(e) => setSaForm((f) => ({ ...f, business_name: e.target.value }))}
                placeholder="Résidence Synacassy 1"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            <Field label="Code banque">
              <input
                value={saForm.settlement_bank}
                onChange={(e) => setSaForm((f) => ({ ...f, settlement_bank: e.target.value }))}
                placeholder="044"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            <Field label="N° de compte">
              <input
                value={saForm.account_number}
                onChange={(e) => setSaForm((f) => ({ ...f, account_number: e.target.value }))}
                placeholder="0123456789"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            <Field label="Commission (%)">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={saForm.percentage_charge}
                onChange={(e) => setSaForm((f) => ({ ...f, percentage_charge: e.target.value }))}
                placeholder="0"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
            {subCreated && (
              <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-emerald">
                <Check size={14} strokeWidth={2} /> Sous-compte créé et enregistré ✓
              </p>
            )}
            {subError && <p className="mt-2 text-[12px] font-semibold text-danger">{subError}</p>}
            <Button
              size="sm"
              loading={createSub.isPending}
              onClick={() => createSub.mutate()}
              className="mt-3"
            >
              Créer le sous-compte
            </Button>
          </div>
        </div>
      )}

      {/* Étape finale — cité & plan (super admin uniquement) */}
      {(isFinalStep && isSa) && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-light text-accent">
                <Building2 size={18} strokeWidth={1.7} />
              </span>
              <div>
                <div className="text-[15px] font-extrabold text-ink">Plan de la cité</div>
                <div className="text-[12px] font-medium text-ink-3">
                  Réservé au super admin — capacité de la résidence
                </div>
              </div>
            </div>

            <Field label="Nombre de villas attendu">
              <input
                type="number"
                inputMode="numeric"
                value={form.nombre_villas_attendu}
                onChange={set("nombre_villas_attendu")}
                placeholder="143"
                className="w-full rounded-md border-[1.5px] border-border bg-surface-2 p-3 text-[15px] text-ink outline-none focus:border-accent"
              />
            </Field>
          </div>
        </div>
      )}

      {/* Traçabilité + retours save — dernier écran (syndic comme super admin) */}
      {isFinalStep && (
        <div className="flex flex-col gap-3">
          {initial?.modifier && (
            <div className="rounded-md bg-surface-2/70 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[.06em] text-ink-3">
                Dernier modificateur
              </div>
              <div className="mt-1 text-[13px] font-bold text-ink">
                {initial.modifier.prenom} {initial.modifier.nom}
                {initial.modifier_at && (
                  <span className="ml-1.5 font-medium text-ink-3">
                    · {formatRelative(initial.modifier_at)}
                  </span>
                )}
              </div>
            </div>
          )}
          {error && <p className="text-xs font-semibold text-danger">{error}</p>}
          {saved && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald">
              <Check size={14} strokeWidth={2} /> Configuration enregistrée.
            </p>
          )}
        </div>
      )}

      {/* Navigation entre étapes */}
      <div className="mt-1 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={prev} className="rounded-md">
            <ChevronLeft size={15} strokeWidth={2} /> Retour
          </Button>
        ) : (
          <span />
        )}
        {isFinalStep ? (
          <Button
            loading={save.isPending}
            onClick={() => save.mutate()}
            className="rounded-md"
          >
            Enregistrer
          </Button>
        ) : (
          <Button onClick={next} className="rounded-md">
            Suivant <ChevronRight size={15} strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-[6px]">
      <label className="text-xs font-bold tracking-[.02em] text-ink-2">{label}</label>
      {children}
    </div>
  );
}
