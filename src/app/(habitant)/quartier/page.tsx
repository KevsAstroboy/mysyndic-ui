"use client";

import { useQuery } from "@tanstack/react-query";
import { Info, Plus } from "lucide-react";
import { useState } from "react";
import { IncidentCard } from "@/components/features/incident/IncidentCard";
import { IncidentForm } from "@/components/features/incident/IncidentForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { incidentApi } from "@/lib/api/incident";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";

export default function IncidentsPage() {
  const { citeId } = useAuth();
  const [open, setOpen] = useState(false);

  const incidents = useQuery({
    queryKey: QUERY_KEYS.incidents(citeId ?? ""),
    queryFn: () => incidentApi.list(citeId!),
    enabled: !!citeId,
  });

  const list = incidents.data ?? [];

  return (
    <div className="pt-3 md:pt-5">
      {/* Action desktop */}
      <div className="hidden items-center justify-between pb-4 md:flex">
        <h2 className="text-[15px] font-extrabold tracking-[-.2px] text-ink">
          Incidents signalés
        </h2>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} strokeWidth={1.8} /> Signaler un incident
        </Button>
      </div>

      {/* Action mobile */}
      <div className="px-4 pb-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 text-sm font-bold text-white shadow-btn"
        >
          <Plus size={18} strokeWidth={1.7} /> Signaler un incident
        </button>
      </div>

      {incidents.isLoading ? (
        <div className="space-y-2.5 px-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:px-0">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-md" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={Info}
          tone="teal"
          title="Aucun incident signalé"
          subtitle="Votre quartier est calme pour le moment. Signalez un problème si vous en repérez un."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} strokeWidth={1.8} /> Signaler un incident
            </Button>
          }
        />
      ) : (
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-4">
          {list.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              className="md:mx-0 md:mb-0"
            />
          ))}
        </div>
      )}

      <IncidentForm open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
