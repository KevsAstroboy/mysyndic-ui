"use client";

import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import type { Incident } from "@/types/incident.types";
import { IncidentPhoto } from "./IncidentPhoto";

export function IncidentCard({
  incident,
  className,
}: {
  incident: Incident;
  className?: string;
}) {
  return (
    <Link
      href={`/quartier/incidents/${incident.id}`}
      className={cn(
        "mx-4 mb-2.5 block rounded-md bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        {incident.categorie && (
          <span className="rounded-pill bg-primary-light px-2.5 py-1 text-[10px] font-bold text-accent">
            {incident.categorie.libelle ?? incident.categorie.code}
          </span>
        )}
        <span className="text-[11px] font-medium text-ink-3">
          {formatRelative(incident.created_at ?? "")}
        </span>
      </div>
      <h3 className="mb-1 text-[15px] font-bold text-ink">
        {incident.titre ?? incident.description}
      </h3>
      <p className="mb-3 line-clamp-2 text-[13px] font-medium text-ink-2">
        {incident.description}
      </p>
      <IncidentPhoto
        path={incident.photo_file_path}
        className="mb-3 aspect-[16/10] rounded-md"
      />
      <div className="flex items-center gap-4 text-xs font-semibold text-ink-3">
        <span className="flex items-center gap-1">
          <Heart
            size={14}
            strokeWidth={1.7}
            className={cn(incident.liked_by_me && "fill-danger text-danger")}
          />
          {incident.likes_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={14} strokeWidth={1.7} />
          {incident.commentaires_count ?? 0}
        </span>
        {incident.auteur && (
          <span className="ml-auto">
            {incident.auteur.prenom} {incident.auteur.nom}
          </span>
        )}
      </div>
    </Link>
  );
}
