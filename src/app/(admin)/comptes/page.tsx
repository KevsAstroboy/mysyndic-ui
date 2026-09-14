"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Shield,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { userApi } from "@/lib/api/user";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import type { User } from "@/types/user.types";

const PAGE_SIZE = 8;

const ROLE_STYLE: Record<string, { tag: string; av: string; label: string }> = {
  SYNDIC: { tag: "bg-primary-light text-primary", av: "bg-primary-light text-primary", label: "Syndic" },
  CHEF_SECURITE: { tag: "bg-gold-soft text-gold", av: "bg-gold-soft text-gold", label: "Chef Sécu." },
  HABITANT: { tag: "bg-surface-2 text-ink-3 border border-border", av: "bg-emerald-soft text-emerald", label: "Habitant" },
  ADMIN: { tag: "bg-[#EDE8FD] text-[#7C3AED]", av: "bg-[#EDE8FD] text-[#7C3AED]", label: "Admin" },
  SUPER_ADMIN: { tag: "bg-[#EDE8FD] text-[#7C3AED]", av: "bg-[#EDE8FD] text-[#7C3AED]", label: "Super Admin" },
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ComptesPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"tous" | "habitants" | "staff">("tous");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const users = useQuery({ queryKey: ["users", "all"], queryFn: userApi.list });

  const toggle = useMutation({
    mutationFn: (u: { id: string; is_active?: boolean }) =>
      u.is_active ? userApi.deactivate(u.id) : userApi.activate(u.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users", "all"] }),
  });

  const all = users.data ?? [];

  const primary = (u: User) => u.roles?.[0]?.code;
  const hasRole = (u: User, code: string) => u.roles?.some((r) => r.code === code) ?? false;

  const stats = useMemo(() => {
    return {
      habitants: all.filter((u) => primary(u) === "HABITANT" && u.is_active).length,
      syndics: all.filter((u) => hasRole(u, "SYNDIC")).length,
      secu: all.filter((u) => hasRole(u, "CHEF_SECURITE")).length,
    };
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((u) => {
      const p = primary(u);
      if (filter === "habitants" && p !== "HABITANT") return false;
      if (filter === "staff" && !["SYNDIC", "CHEF_SECURITE", "ADMIN"].includes(p ?? ""))
        return false;
      if (!q) return true;
      const name = `${u.prenom} ${u.nom}`.toLowerCase();
      return name.includes(q) || (u.email ?? "").toLowerCase().includes(q);
    });
  }, [all, query, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Gestion des comptes"
        subtitle={`${all.length} comptes · ${stats.habitants} habitants actifs`}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={16} strokeWidth={2} /> Créer un compte
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink md:hidden">
            Comptes
          </h1>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn md:hidden"
            aria-label="Créer un compte"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Stat cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Habitants actifs" value={String(stats.habitants)} icon={Users} tone="teal" />
          <Stat label="Syndic" value={String(stats.syndics)} icon={UserCheck} tone="gold" />
          <Stat label="Chefs de sécu." value={String(stats.secu)} icon={Shield} tone="purple" />
        </div>

        {/* Recherche + filtres */}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-xs">
            <Search
              size={16}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher un compte…"
              className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-[11px] pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-primary"
            />
          </div>
          <div className="flex gap-1.5">
            {(["tous", "habitants", "staff"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setPage(1);
                }}
                className={cn(
                  "rounded-pill px-3.5 py-1.5 text-[12px] font-bold capitalize",
                  filter === f
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-ink-3 border border-border",
                )}
              >
                {f === "tous" ? "Tous" : f === "habitants" ? "Habitants" : "Staff"}
              </button>
            ))}
          </div>
        </div>

        {/* Table desktop */}
        <div className="mt-4 hidden overflow-hidden rounded-md bg-surface shadow-card md:block">
          <div className="grid grid-cols-[1.5fr_130px_90px_90px_120px] items-center border-b border-border bg-surface-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.05em] text-ink-3">
            <div>Compte</div>
            <div>Rôle</div>
            <div>Villa</div>
            <div>Statut</div>
            <div className="text-right">Actions</div>
          </div>
          {users.isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 rounded-md" />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm font-medium text-ink-3">
              Aucun compte trouvé.
            </p>
          ) : (
            pageItems.map((u) => {
              const meta = ROLE_STYLE[u.roles?.[0]?.code ?? ""] ?? ROLE_STYLE.HABITANT;
              const name = `${u.prenom} ${u.nom}`.trim();
              const isMe = u.id === me?.id;
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1.5fr_130px_90px_90px_120px] items-center border-b border-border px-5 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                        meta.av,
                      )}
                    >
                      {initials(name)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-bold text-ink">
                          {name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold text-ink-3">(vous)</span>
                        )}
                      </div>
                      <div className="truncate text-[11px] font-medium text-ink-3">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <RoleTags roles={u.roles ?? []} />
                  <div className="text-[12px] font-semibold text-ink-2">
                    {u.villa ? `Villa ${u.villa.numero}` : "—"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-[7px] w-[7px] rounded-full",
                        u.is_active ? "bg-emerald" : "bg-ink-3",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        u.is_active ? "text-emerald" : "text-ink-3",
                      )}
                    >
                      {u.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    {!isMe && (
                      <button
                        onClick={() => toggle.mutate(u)}
                        disabled={toggle.isPending}
                        className="rounded-md bg-surface-2 px-3 py-1.5 text-[11px] font-bold text-ink-2 disabled:opacity-50"
                      >
                        {u.is_active ? "Désactiver" : "Activer"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Liste mobile */}
        <div className="mt-4 flex flex-col gap-2 md:hidden">
          {users.isLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-md" />)
          ) : pageItems.length === 0 ? (
            <EmptyState icon={Users} tone="teal" title="Aucun compte" subtitle="Aucun résultat." />
          ) : (
            pageItems.map((u) => {
              const meta = ROLE_STYLE[u.roles?.[0]?.code ?? ""] ?? ROLE_STYLE.HABITANT;
              const name = `${u.prenom} ${u.nom}`.trim();
              const isMe = u.id === me?.id;
              return (
                <div key={u.id} className="rounded-md bg-surface p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold",
                        meta.av,
                      )}
                    >
                      {initials(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-ink">{name}</span>
                      </div>
                      <div className="truncate text-[12px] font-medium text-ink-3">
                        {u.email}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <RoleTags roles={u.roles ?? []} />
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-ink-3">
                        {u.villa ? `Villa ${u.villa.numero}` : "—"} ·{" "}
                        {u.is_active ? "Actif" : "Inactif"}
                      </div>
                    </div>
                    {!isMe && (
                      <button
                        onClick={() => toggle.mutate(u)}
                        disabled={toggle.isPending}
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                          u.is_active
                            ? "bg-danger-soft text-danger"
                            : "bg-emerald-soft text-emerald",
                        )}
                        aria-label={u.is_active ? "Désactiver" : "Activer"}
                      >
                        {u.is_active ? <X size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
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

      <CreateStaffSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function RoleTags({ roles }: { roles: { code: string; libelle?: string }[] }) {
  if (roles.length === 0) {
    const fallback = ROLE_STYLE.HABITANT;
    return (
      <span className={cn("rounded-pill px-2 py-0.5 text-[10px] font-bold", fallback.tag)}>
        {fallback.label}
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => {
        const meta = ROLE_STYLE[r.code] ?? ROLE_STYLE.HABITANT;
        return (
          <span
            key={r.code}
            className={cn("rounded-pill px-2 py-0.5 text-[10px] font-bold", meta.tag)}
          >
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function Stat({
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
      <div className="mt-2.5 text-[22px] font-extrabold tracking-[-.4px] text-ink md:text-[26px]">
        {value}
      </div>
      <div className="text-[10px] font-semibold text-ink-3 md:text-[11px]">{label}</div>
    </div>
  );
}

function CreateStaffSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<"SYNDIC" | "CHEF_SECURITE">("CHEF_SECURITE");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () =>
      userApi.createStaff({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim() || undefined,
        profil_code: role,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users", "all"] });
      setPrenom("");
      setNom("");
      setEmail("");
      setTelephone("");
      setError(null);
      onClose();
    },
    onError: (e) => setError(apiErrorMessage(e, "Création impossible")),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="Créer un compte staff">
      <div className="flex flex-col gap-4">
        <p className="-mt-1 text-[13px] font-medium text-ink-3">
          Un email avec un mot de passe temporaire sera envoyé automatiquement.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Nom">
            <input value={nom} onChange={(e) => setNom(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="b.traore@mysyndic.ci"
            className={inputCls}
          />
        </Field>
        <Field label="Téléphone (optionnel)">
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+225 05 67 89 01"
            className={inputCls}
          />
        </Field>

        <Field label="Rôle">
          <div className="flex gap-2">
            {(["CHEF_SECURITE", "SYNDIC"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 rounded-sm border-[1.5px] px-3 py-2.5 text-[13px] font-bold",
                  role === r
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-surface-2 text-ink-3",
                )}
              >
                {r === "CHEF_SECURITE" ? "Chef de Sécurité" : "Syndic"}
              </button>
            ))}
          </div>
        </Field>

        {error && <p className="text-xs font-semibold text-danger">{error}</p>}

        <Button
          fullWidth
          size="lg"
          loading={create.isPending}
          onClick={() => create.mutate()}
          disabled={!prenom.trim() || !nom.trim() || !email.trim()}
          className="rounded-md py-4 text-[15px]"
        >
          Créer le compte
        </Button>
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
