"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { profilApi, type ProfilFeatures } from "@/lib/api/profil";
import { cn } from "@/lib/utils/cn";

const IMMUABLES = ["SUPER_ADMIN"];

export default function ProfilsFeaturesPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["profils", "features"],
    queryFn: profilApi.features,
  });

  // Jeux modifiés localement + jeux en base (pour delta/annulation).
  const [picks, setPicks] = useState<Record<number, Set<string>> | null>(null);
  const [base, setBase] = useState<Record<number, Set<string>> | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  // Module affiché pour le profil actif : clé `${profilId}:${module}`.
  const [moduleKey, setModuleKey] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const list = query.data ?? [];
  const editable = list.filter((p) => !IMMUABLES.includes(p.code));

  // Active le premier profil dès réception des données.
  const resolvedActive =
    activeId != null && editable.some((p) => p.id === activeId)
      ? activeId
      : editable[0]?.id ?? null;

  if (picks == null && query.data) {
    const fresh: Record<number, Set<string>> = {};
    const snapshot: Record<number, Set<string>> = {};
    for (const p of query.data) {
      const set = new Set<string>();
      for (const m of p.modules) {
        for (const f of m.features) if (f.active) set.add(f.code);
      }
      fresh[p.id] = new Set(set);
      snapshot[p.id] = set;
    }
    setPicks(fresh);
    setBase(snapshot);
  }

  const active = editable.find((p) => p.id === resolvedActive) ?? null;
  const selected = picks && active ? picks[active.id] ?? new Set<string>() : new Set<string>();
  const savedSel = base && active ? base[active.id] ?? new Set<string>() : new Set<string>();
  const dirty = !!active && dirtyOf(selected, savedSel) > 0;

  // Modules visibles (filtrés par la recherche) + module affiché en détail.
  const visModules = active ? visibleModules(active, q) : [];
  const resolvedModule =
    (active && visModules.find((m) => `${active.id}:${m.module}` === moduleKey)) ||
    visModules[0] ||
    null;

  const toggle = (profilId: number, code: string) => {
    if (!picks) return;
    const next = new Set(picks[profilId] ?? []);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setPicks({ ...picks, [profilId]: next });
  };

  const toggleModule = (profilId: number, moduleName: string, enable: boolean) => {
    if (!picks) return;
    const next = new Set(picks[profilId] ?? []);
    const mod = active?.modules.find((m) => m.module === moduleName);
    for (const f of mod?.features ?? []) {
      if (enable) next.add(f.code);
      else next.delete(f.code);
    }
    setPicks({ ...picks, [profilId]: next });
  };

  const cancel = () => {
    if (!picks || !base || !active) return;
    setPicks({ ...picks, [active.id]: new Set(base[active.id] ?? []) });
  };

  const save = useMutation({
    mutationFn: (args: { profilId: number; features: string[] }) =>
      profilApi.setFeatures(args.profilId, args.features),
    onSuccess: () => {
      if (active && picks) {
        setBase({ ...(base ?? {}), [active.id]: new Set(picks[active.id] ?? []) });
      }
      qc.invalidateQueries({ queryKey: ["profils", "features"] });
    },
  });

  if (query.isLoading || !picks) {
    return (
      <>
        <PageHeader title="Permissions par profil" subtitle="Super admin · features par profil" />
        <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
          <div className="grid gap-5 md:grid-cols-[240px_1fr]">
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-[420px] rounded-md" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Permissions par profil" subtitle="Super admin · cochez/décochez les features d'un profil" />

      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-5 md:px-8">
        {/* Sélecteur de profil — mobile : chips horizontaux */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
          {editable.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[12px] font-bold",
                p.id === resolvedActive
                  ? "bg-primary text-white"
                  : "bg-surface text-ink-3 shadow-card",
              )}
            >
              {p.libelle}
            </button>
          ))}
        </div>

        <div className="mt-3 grid gap-5 md:mt-0 md:grid-cols-[250px_1fr]">
          {/* ── Colonne gauche : liste des profils ── */}
          <div className="hidden flex-col gap-2 md:flex">
            {editable.map((p) => {
              const on = picks?.[p.id]?.size ?? 0;
              const total = p.modules.reduce((s, m) => s + m.features.length, 0);
              const isDirty = dirtyOf(picks?.[p.id] ?? new Set(), base?.[p.id] ?? new Set()) > 0;
              const pct = total ? Math.round((on / total) * 100) : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    "rounded-md border p-3.5 text-left transition-colors",
                    p.id === resolvedActive
                      ? "border-accent bg-primary-light"
                      : "border-border bg-surface hover:border-accent/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-extrabold text-ink">
                        {p.libelle}
                      </div>
                      <div className="text-[11px] font-semibold text-ink-3">
                        {on}/{total} actives
                      </div>
                    </div>
                    {isDirty && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" title="Modifié" />
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface-2">
                    <div
                      className="h-full rounded-pill bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Colonne droite : détail du profil sélectionné ── */}
          {active ? (
            <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-card">
              {/* En-tête du panneau */}
              <div className="flex items-start justify-between gap-3 border-b border-border p-4 md:p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary-light text-accent">
                    <Shield size={18} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[16px] font-extrabold text-ink">{active.libelle}</div>
                    <div className="text-[12px] font-medium text-ink-3">
                      {active.code} · {selected.size}/{totalOf(active)} features actives
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-extrabold",
                    dirty ? "bg-gold-soft text-gold" : "bg-emerald-soft text-emerald",
                  )}
                >
                  {dirty ? `${dirtyOf(selected, savedSel)} modif.` : "À jour"}
                </span>
              </div>

              {/* Recherche */}
              <div className="border-b border-border px-4 py-3 md:px-5">
                <div className="relative">
                  <Search
                    size={15}
                    strokeWidth={2}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Filtrer les permissions…"
                    className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-2 pl-9 pr-8 text-[13px] font-medium text-ink outline-none placeholder:text-ink-3 focus:border-accent"
                  />
                  {q && (
                    <button
                      onClick={() => setQ("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                      aria-label="Effacer"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Modules — chips (master) */}
              <div className="border-b border-border px-4 py-3 md:px-5">
                {visModules.length === 0 ? (
                  <p className="py-2 text-center text-[12px] font-medium text-ink-3">
                    Aucune permission ne correspond à « {q} ».
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {visModules.map((m) => {
                      const onCount = m.features.filter((f) => selected.has(f.code)).length;
                      const allOn = onCount === m.features.length;
                      const isCurrent = resolvedModule?.module === m.module;
                      return (
                        <button
                          key={m.module}
                          type="button"
                          onClick={() => setModuleKey(`${active.id}:${m.module}`)}
                          className={cn(
                            "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-bold transition-colors",
                            isCurrent
                              ? "border-accent bg-primary text-white"
                              : allOn
                                ? "border-emerald/50 bg-emerald-soft text-emerald"
                                : "border-border bg-surface-2 text-ink-3 hover:border-accent/40 hover:text-ink-2",
                          )}
                        >
                          <span>{m.module}</span>
                          <span
                            className={cn(
                              "rounded-pill px-1.5 py-0.5 text-[10px] font-extrabold",
                              isCurrent
                                ? "bg-white/20 text-white"
                                : allOn
                                  ? "bg-emerald/15 text-emerald"
                                  : "bg-surface text-ink-3",
                            )}
                          >
                            {onCount}/{m.features.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Features du module sélectionné (détail) */}
              {resolvedModule ? (
                <div className="p-4 md:p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[13px] font-extrabold uppercase tracking-[.06em] text-ink">
                        {resolvedModule.module}
                      </div>
                      <div className="text-[11px] font-semibold text-ink-3">
                        {
                          resolvedModule.features.filter((f) => selected.has(f.code)).length
                        }{" "}
                        / {resolvedModule.features.length} active
                        {resolvedModule.features.length > 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleModule(active.id, resolvedModule.module, true)}
                        className="rounded-md bg-primary-light px-3 py-1.5 text-[11px] font-bold text-accent transition-colors hover:bg-primary/15"
                      >
                        Tout activer
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleModule(active.id, resolvedModule.module, false)}
                        className="rounded-md bg-surface-2 px-3 py-1.5 text-[11px] font-bold text-ink-3 transition-colors hover:bg-border"
                      >
                        Tout retirer
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    {resolvedModule.features.map((f) => {
                      const on = selected.has(f.code);
                      return (
                        <button
                          key={f.code}
                          type="button"
                          onClick={() => toggle(active.id, f.code)}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors",
                            on
                              ? "border-accent/25 bg-primary-light text-ink"
                              : "border-border bg-surface text-ink-3 hover:border-accent/40 hover:bg-surface-2/40 hover:text-ink-2",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors",
                              on
                                ? "border-accent bg-primary text-white"
                                : "border-border bg-surface group-hover:border-accent/40",
                            )}
                          >
                            {on && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1 leading-snug">{f.libelle ?? f.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[13px] font-medium text-ink-3">
                    Sélectionnez un module pour voir ses permissions.
                  </p>
                </div>
              )}

              {/* Barre d'action collante */}
              <div className="sticky bottom-0 border-t border-border bg-surface p-3.5 md:p-4">
                {dirty ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="hidden text-[12px] font-bold text-ink-3 md:block">
                      {dirtyOf(selected, savedSel)} modification(s) non enregistrée(s)
                    </span>
                    <div className="flex w-full gap-2 md:w-auto md:justify-end">
                      <button
                        onClick={cancel}
                        disabled={save.isPending}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-surface-2 px-4 py-2.5 text-[13px] font-bold text-ink-3 disabled:opacity-50 md:flex-none"
                      >
                        <RotateCcw size={14} strokeWidth={2} /> Annuler
                      </button>
                      <button
                        onClick={() =>
                          save.mutate({ profilId: active.id, features: Array.from(selected) })
                        }
                        disabled={save.isPending}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-[13px] font-bold text-white disabled:opacity-50 md:flex-none"
                      >
                        {save.isPending ? (
                          "Enregistrement…"
                        ) : (
                          <>
                            <Check size={15} strokeWidth={2.5} /> Enregistrer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-[12px] font-semibold text-ink-3">
                    Aucune modification en attente — cochez une permission pour l'activer.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-surface p-8 text-center text-ink-3">
              Aucun profil éditable.
            </div>
          )}
        </div>

        {/* Navigation mobile entre profils */}
        <MobilePager
          current={resolvedActive}
          items={editable}
          onChange={setActiveId}
          visible={!!active}
        />
      </div>
    </>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function totalOf(p: ProfilFeatures): number {
  return p.modules.reduce((s, m) => s + m.features.length, 0);
}

function dirtyOf(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const x of a) if (!b.has(x)) n++;
  for (const x of b) if (!a.has(x)) n++;
  return n;
}

function visibleModules(p: ProfilFeatures, q: string) {
  const term = q.trim().toLowerCase();
  if (!term) return p.modules;
  return p.modules
    .map((m) => ({
      ...m,
      features: m.features.filter(
        (f) =>
          (f.libelle ?? "").toLowerCase().includes(term) || f.code.toLowerCase().includes(term),
      ),
    }))
    .filter((m) => m.features.length > 0);
}

/* ── Pager mobile (prev/next profil) ─────────────────────── */

function MobilePager({
  current,
  items,
  onChange,
  visible,
}: {
  current: number | null;
  items: ProfilFeatures[];
  onChange: (id: number) => void;
  visible: boolean;
}) {
  if (!visible) return null;
  const idx = items.findIndex((p) => p.id === current);
  const prev = idx > 0 ? items[idx - 1] : null;
  const next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
  return (
    <div className="mt-4 flex items-center justify-between md:hidden">
      <button
        disabled={!prev}
        onClick={() => prev && onChange(prev.id)}
        className="flex items-center gap-1 rounded-md bg-surface px-3 py-2 text-[12px] font-bold text-ink-3 disabled:opacity-40"
      >
        <ChevronLeft size={14} strokeWidth={2} /> {prev?.libelle ?? "—"}
      </button>
      <span className="text-[12px] font-semibold text-ink-3">
        {idx + 1}/{items.length}
      </span>
      <button
        disabled={!next}
        onClick={() => next && onChange(next.id)}
        className="flex items-center gap-1 rounded-md bg-surface px-3 py-2 text-[12px] font-bold text-ink-3 disabled:opacity-40"
      >
        {next?.libelle ?? "—"} <ChevronRight size={14} strokeWidth={2} />
      </button>
    </div>
  );
}