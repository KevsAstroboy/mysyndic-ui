"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthBusyOverlay } from "./AuthBusyOverlay";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { authApi, publicApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/utils/apiError";

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

const STRENGTH = [
  { label: "", pct: 0, color: "#E8453C" },
  { label: "Faible", pct: 28, color: "#E8453C" },
  { label: "Moyen", pct: 55, color: "#E8A020" },
  { label: "Bon", pct: 80, color: "#00A87C" },
  { label: "Excellent", pct: 100, color: "#0D6E5A" },
];

function pwdScore(pwd: string): number {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(4, Math.max(1, s));
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[11px] font-bold uppercase tracking-[.12em] text-ink-3 first:mt-0">
      {children}
    </p>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [citeId, setCiteId] = useState("");
  const [villaId, setVillaId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [cgu, setCgu] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const score = pwdScore(password);

  const cites = useQuery({
    queryKey: ["public-cites"],
    queryFn: publicApi.cites,
    staleTime: 1000 * 60 * 10,
  });

  const villas = useQuery({
    queryKey: ["public-villas", citeId],
    queryFn: () => publicApi.villas(citeId),
    enabled: !!citeId,
    staleTime: 1000 * 60 * 5,
  });

  const VILLA_STATUT_LABEL: Record<string, string> = {
    libre: "Libre",
    occupee: "Occupée · colocation",
    en_attente: "En attente",
  };

  const register = useMutation({
    mutationFn: () =>
      authApi.register({
        prenom,
        nom,
        email,
        telephone: telephone || undefined,
        password,
        villa_id: villaId,
      }),
    onSuccess: (data) => {
      router.replace(`/activate?email=${encodeURIComponent(data.email)}`);
    },
    onError: (e) => setFormError(apiErrorMessage(e, "Inscription impossible")),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!prenom.trim()) next.prenom = "Prénom requis";
    if (!nom.trim()) next.nom = "Nom requis";
    if (!citeId) next.citeId = "Choisissez votre cité";
    if (!villaId) next.villaId = "Choisissez votre villa";
    if (password.length < 8) next.password = "8 caractères minimum";
    else if (!PWD_RE.test(password))
      next.password = "Majuscule, minuscule et chiffre requis";
    if (confirm !== password)
      next.confirm = "Les mots de passe ne correspondent pas";
    if (!cgu) next.cgu = "Vous devez accepter les conditions";

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length === 0) register.mutate();
  };

  return (
    <AuthShell
      wide
      headline={
        <>
          Rejoignez
          <br />
          votre cité 🏘️
        </>
      }
      sub="Créez votre compte habitant pour payer vos cotisations et rester connecté à votre cité."
      footer={
        <p className="text-center text-[13px] font-medium text-ink-3">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-bold text-accent">
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {formError && (
          <div className="flex items-start gap-2.5 rounded-md bg-danger-soft px-3.5 py-3">
            <AlertCircle
              size={16}
              strokeWidth={2}
              className="mt-px shrink-0 text-danger"
            />
            <p className="text-xs font-semibold text-danger">{formError}</p>
          </div>
        )}

        <SectionLabel>Vos informations</SectionLabel>

        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Prénom"
            placeholder="Kofi"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            error={errors.prenom}
          />
          <Input
            label="Nom"
            placeholder="Mensah"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            error={errors.nom}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="kofi@email.com"
            leadingIcon={<Mail size={18} strokeWidth={1.7} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+225 07 12 34 56"
            leadingIcon={<Phone size={18} strokeWidth={1.7} />}
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
        </div>

        <SectionLabel>Votre logement</SectionLabel>

        <Select
          label="Cité"
          placeholder="Sélectionnez votre cité"
          value={citeId}
          onChange={(v) => {
            setCiteId(v);
            setVillaId("");
          }}
          error={errors.citeId}
          options={(cites.data ?? []).map((c) => ({
            value: c.id,
            label: `${c.nom}${c.ville ? ` · ${c.ville}` : ""}`,
          }))}
        />

        <Select
          label="Villa"
          placeholder={
            !citeId
              ? "Choisissez d'abord une cité"
              : villas.isLoading
                ? "Chargement…"
                : (villas.data ?? []).length === 0
                  ? "Aucune villa"
                  : "Sélectionnez votre villa"
          }
          value={villaId}
          onChange={setVillaId}
          disabled={!citeId || villas.isLoading}
          error={errors.villaId}
          options={(villas.data ?? []).map((v) => ({
            value: v.id,
            label: `N° ${v.numero}${v.rue ? ` · ${v.rue}` : ""} — ${
              VILLA_STATUT_LABEL[v.statut] ?? v.statut
            }`,
            disabled: v.statut === "en_attente",
          }))}
        />

        <div className="flex items-start gap-2.5 rounded-sm bg-gold-soft px-3 py-2.5">
          <Lock
            size={16}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-gold"
          />
          <p className="text-[11px] font-semibold text-gold">
            Villa et rue verrouillées après inscription. Seul le syndic peut les
            modifier.
          </p>
        </div>

        <SectionLabel>Sécurité</SectionLabel>

        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••••"
          leadingIcon={<Lock size={18} strokeWidth={1.7} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="pointer-events-auto text-ink-3 transition-colors hover:text-ink-2"
              aria-label="Afficher le mot de passe"
            >
              {showPwd ? (
                <EyeOff size={18} strokeWidth={1.7} />
              ) : (
                <Eye size={18} strokeWidth={1.7} />
              )}
            </button>
          }
        />

        {password && (
          <div className="-mt-1 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
              <div
                className="h-full rounded-pill transition-all duration-300"
                style={{
                  width: `${STRENGTH[score].pct}%`,
                  background: STRENGTH[score].color,
                }}
              />
            </div>
            <span
              className="w-16 text-right text-[11px] font-bold"
              style={{ color: STRENGTH[score].color }}
            >
              {STRENGTH[score].label}
            </span>
          </div>
        )}

        <Input
          label="Confirmer le mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
          leadingIcon={<Lock size={18} strokeWidth={1.7} />}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
        />

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={cgu}
            onChange={(e) => setCgu(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
          />
          <span className="text-xs font-medium leading-relaxed text-ink-3">
            J&apos;accepte les{" "}
            <span className="font-bold text-accent">Conditions générales</span>{" "}
            et la politique de confidentialité
          </span>
        </label>
        {errors.cgu && (
          <p className="-mt-2 text-xs font-semibold text-danger">{errors.cgu}</p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 rounded-md py-4 text-base tracking-[-.2px] shadow-[0_4px_20px_rgba(13,110,90,.3)]"
          loading={register.isPending}
        >
          {register.isPending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <AuthBusyOverlay
        show={register.isPending}
        label="Création de votre compte…"
      />
    </AuthShell>
  );
}
