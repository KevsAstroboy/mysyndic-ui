"use client";

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, Check, Home, LogIn, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RejoindreCiteSheet } from "@/components/features/villa/RejoindreCiteSheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { villaApi } from "@/lib/api/villa";
import { useCurrentVilla } from "@/lib/hooks/useCurrentVilla";
import { formatRelative } from "@/lib/utils/formatDate";

export default function ColocationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const me = useCurrentVilla();
  const [rejoindreOpen, setRejoindreOpen] = useState(false);

  const villaId = me.data?.villa?.id;

  const candidatures = useQuery({
    queryKey: ["villas", villaId, "candidatures"],
    queryFn: () => villaApi.candidaturesVilla(villaId!),
    enabled: !!villaId,
  });

  const mesCandidatures = useQuery({
    queryKey: ["villas", "mes-candidatures"],
    queryFn: villaApi.mesCandidatures,
  });

  const decision = useMutation({
    mutationFn: (d: { userVillaId: string; action: "valider" | "refuser" }) =>
      d.action === "valider"
        ? villaApi.validerColocataire(villaId!, d.userVillaId)
        : villaApi.refuserColocataire(villaId!, d.userVillaId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["villas", villaId, "candidatures"],
      }),
  });

  const list = candidatures.data ?? [];
  const villa = me.data?.villa;
  const mesAttentes = mesCandidatures.data ?? [];

  return (
    <>
      <PageHeader
        title="Colocations"
        subtitle="Demandes de colocation pour votre villa"
        actions={
          <button
            onClick={() => setRejoindreOpen(true)}
            className="hidden items-center gap-2 rounded-md bg-primary-light px-4 py-2.5 text-[13px] font-bold text-accent md:inline-flex"
          >
            <LogIn size={16} strokeWidth={1.8} /> Rejoindre une autre cité
          </button>
        }
      />

      <div className="mx-auto w-full max-w-6xl md:px-8">
        {/* En-tête mobile */}
        <div className="flex items-center gap-3 px-5 pb-3 pt-4 md:hidden">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card"
            aria-label="Retour"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <h1 className="text-lg font-extrabold tracking-[-.3px] text-ink">
            Colocations
          </h1>
        </div>

        {/* Carte « Ma villa » + CTA rejoindre */}
        <div className="mt-3 rounded-md bg-surface p-4 shadow-card md:mt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-accent">
                <Home size={20} strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-ink-3">Ma villa</div>
                {me.isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <div className="truncate text-[15px] font-extrabold text-ink">
                    {villa
                      ? `Villa ${villa.numero}${villa.rue ? ` · ${villa.rue}` : ""}`
                      : "Aucune villa confirmée"}
                  </div>
                )}
                <div className="truncate text-[11px] font-medium text-ink-3">
                  {me.data?.cite?.nom ?? ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => setRejoindreOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-3 text-[13px] font-bold text-white shadow-btn md:hidden"
            >
              <LogIn size={15} strokeWidth={1.8} /> Rejoindre une cité
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-6 md:px-0 md:pt-6">
          {mesAttentes.length > 0 && (
            <div className="overflow-hidden rounded-md bg-surface shadow-card md:mt-4">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-[13px] font-extrabold text-ink">
                  Mes demandes en cours
                </span>
                <Chip variant="gold">
                  {mesAttentes.length} en attente
                </Chip>
              </div>
              {mesAttentes.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-accent">
                    <Building2 size={19} strokeWidth={1.7} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink">
                      {d.cite?.nom ?? "Cité"}
                    </div>
                    <div className="truncate text-[12px] font-medium text-ink-3">
                      Villa {d.villa.numero}
                      {d.villa.rue ? ` · ${d.villa.rue}` : ""}
                      {" "}· {[d.cite?.ville, d.cite?.pays].filter(Boolean).join(" · ")}
                    </div>
                    <div className="text-[11px] font-medium text-ink-3">
                      Déposée {formatRelative(d.created_at ?? "")}
                    </div>
                  </div>
                  <Chip variant="gold">En attente</Chip>
                </div>
              ))}
            </div>
          )}

          {!villaId ? (
            <EmptyState
              icon={Users}
              tone="teal"
              title="Aucune villa"
              subtitle="Déposez une candidature pour une villa d'une autre cité, ou attendez qu'une demande vous soit transmise."
              action={
                <button
                  onClick={() => setRejoindreOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-white shadow-btn"
                >
                  <LogIn size={16} strokeWidth={1.8} /> Rejoindre une autre cité
                </button>
              }
            />
          ) : candidatures.isLoading ? (
            [0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-md" />)
          ) : list.length === 0 ? (
            <EmptyState
              icon={Users}
              tone="teal"
              title="Aucune demande"
              subtitle="Les demandes de colocation pour votre villa apparaîtront ici."
              action={
                <button
                  onClick={() => setRejoindreOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-primary-light px-6 py-3 text-sm font-bold text-accent shadow-card"
                >
                  <LogIn size={16} strokeWidth={1.8} /> Rejoindre une autre cité
                </button>
              }
            />
          ) : (
            list.map((c) => {
              const name = `${c.user.prenom} ${c.user.nom}`.trim();
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-md bg-surface p-3.5 shadow-card"
                >
                  <Avatar name={name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink">{name}</div>
                    <div className="truncate text-[12px] font-medium text-ink-3">
                      {c.user.email ?? c.user.telephone ?? ""}
                    </div>
                    <div className="text-[11px] font-medium text-ink-3">
                      {formatRelative(c.created_at ?? "")}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() =>
                        decision.mutate({ userVillaId: c.id, action: "valider" })
                      }
                      disabled={decision.isPending}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-soft px-3 py-2 text-[12px] font-bold text-emerald disabled:opacity-50"
                    >
                      <Check size={14} strokeWidth={2} />
                      Accepter
                    </button>
                    <button
                      onClick={() =>
                        decision.mutate({ userVillaId: c.id, action: "refuser" })
                      }
                      disabled={decision.isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-danger-soft text-danger disabled:opacity-50"
                      aria-label="Refuser"
                    >
                      <X size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <RejoindreCiteSheet
        open={rejoindreOpen}
        onClose={() => setRejoindreOpen(false)}
      />
    </>
  );
}