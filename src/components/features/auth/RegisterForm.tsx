"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { authApi, publicApi } from "@/lib/api/auth";
import { apiErrorMessage } from "@/lib/utils/apiError";

const PWD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

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
  const [cgu, setCgu] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

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
    if (confirm !== password) next.confirm = "Les mots de passe ne correspondent pas";
    if (!cgu) next.cgu = "Vous devez accepter les conditions";

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length === 0) register.mutate();
  };

  return (
    <AuthShell
      headline={
        <>
          Rejoignez
          <br />
          votre cité 🏘️
        </>
      }
      sub="Créez votre compte habitant pour payer vos cotisations et rester connecté à votre cité."
    >
      <form onSubmit={submit} className="flex flex-col gap-2">
        {formError && (
          <div className="rounded-md bg-danger-soft px-3.5 py-3 text-xs font-semibold text-danger">
            {formError}
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Email"
            type="email"
            placeholder="kofi@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+225 07 12 34 56"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
        </div>

        <Select
          label="Cité"
          value={citeId}
          onChange={(e) => {
            setCiteId(e.target.value);
            setVillaId("");
          }}
          error={errors.citeId}
        >
          <option value="">Sélectionnez votre cité</option>
          {cites.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
              {c.ville ? ` · ${c.ville}` : ""}
            </option>
          ))}
        </Select>

        <Select
          label="Villa"
          value={villaId}
          onChange={(e) => setVillaId(e.target.value)}
          disabled={!citeId || villas.isLoading}
          error={errors.villaId}
        >
          <option value="">
            {!citeId
              ? "Choisissez d'abord une cité"
              : villas.isLoading
                ? "Chargement…"
                : (villas.data ?? []).length === 0
                  ? "Aucune villa"
                  : "Sélectionnez votre villa"}
          </option>
          {(villas.data ?? []).map((v) => {
            const dispo = v.statut !== "en_attente";
            return (
              <option key={v.id} value={v.id} disabled={!dispo}>
                N° {v.numero}
                {v.rue ? ` · ${v.rue}` : ""} —{" "}
                {VILLA_STATUT_LABEL[v.statut] ?? v.statut}
              </option>
            );
          })}
        </Select>

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="8 caractères minimum, une majuscule et un chiffre"
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
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

        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={cgu}
            onChange={(e) => setCgu(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
          />
          <span className="text-xs font-medium leading-relaxed text-ink-3">
            J&apos;accepte les{" "}
            <span className="font-bold text-primary">Conditions générales</span> et
            la politique de confidentialité
          </span>
        </label>
        {errors.cgu && (
          <p className="text-xs font-semibold text-danger">{errors.cgu}</p>
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

        <p className="mt-1 text-center text-[13px] font-medium text-ink-3">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-bold text-primary">
            Se connecter
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
