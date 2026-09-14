"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Search, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { messageApi } from "@/lib/api/message";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatRelative } from "@/lib/utils/formatDate";
import type { MessageContact } from "@/types/message.types";

const GROUPE_ID = "__groupe__";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  SYNDIC: "Syndic",
  ADMIN: "Admin",
  CHEF_SECURITE: "Sécurité",
  HABITANT: "Habitant",
};

export default function MessagesPage() {
  const router = useRouter();
  const { profilActif } = useAuth();
  const [contactsOpen, setContactsOpen] = useState(false);

  const conversations = useQuery({
    queryKey: QUERY_KEYS.conversations(),
    queryFn: messageApi.conversations,
    refetchInterval: 10000,
  });

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Discutez avec le syndic ou le groupe de la cité"
        actions={
          <button
            onClick={() => setContactsOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-white shadow-btn"
          >
            Nouveau message
          </button>
        }
      />

      <div className="mx-auto w-full max-w-3xl md:px-8">
        <div className="flex items-center justify-between px-5 pb-2 pt-4 md:hidden">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink">
            Messages
          </h1>
          <button
            onClick={() => setContactsOpen(true)}
            aria-label="Nouveau message"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-btn"
          >
            <Users size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-4 pb-6 md:px-0 md:pt-6">
          {conversations.isLoading ? (
            [0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-md" />
            ))
          ) : (conversations.data ?? []).length === 0 ? (
            <EmptyState
              icon={Users}
              tone="gold"
              title="Aucune conversation"
              subtitle="Démarrez une conversation avec le syndic ou un habitant."
              action={
                <button
                  onClick={() => setContactsOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-bold text-ink shadow-[0_4px_14px_rgba(232,160,32,.3)]"
                >
                  Écrire à quelqu'un
                </button>
              }
            />
          ) : (
            (conversations.data ?? []).map((c) => {
              const isGroupe = c.est_groupe || c.thread_id === GROUPE_ID;
              const href = isGroupe
                ? "/messages/groupe"
                : `/messages/${c.other_user_id}`;
              const contact = c.contact;
              const name = isGroupe
                ? c.group_name ?? profilActif?.citeNom ?? "Groupe de la cité"
                : `${contact?.prenom ?? ""} ${contact?.nom ?? ""}`.trim() ||
                  "Discussion";
              return (
                <Link
                  key={c.thread_id}
                  href={href}
                  className="flex items-center gap-3 rounded-md bg-surface p-3.5 shadow-card"
                >
                  {isGroupe ? (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                      <Users size={20} strokeWidth={1.7} />
                    </span>
                  ) : (
                    <Avatar name={name} size={40} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink">
                      {name}
                    </div>
                    <div className="text-[11px] font-medium text-ink-3">
                      {formatRelative(c.last_message_at ?? "")}
                    </div>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-danger px-1.5 text-[10px] font-bold text-white">
                      {c.unread_count}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      <ContactsSheet
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
        onSelect={(id) => {
          setContactsOpen(false);
          router.push(`/messages/${id}`);
        }}
      />
    </>
  );
}

function ContactsSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const contacts = useQuery({
    queryKey: ["messages", "contacts"],
    queryFn: messageApi.contacts,
    enabled: open,
  });

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = contacts.data ?? [];
    if (!query) return list;
    const hay = (c: MessageContact) =>
      [
        c.prenom,
        c.nom,
        ...(c.villas ?? []).flatMap((v) => [v.numero, v.rue ?? ""]),
        c.roles?.map((r) => `${r.code} ${r.libelle ?? ""}`).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return list.filter((c) => hay(c).includes(query));
  }, [contacts.data, q]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Nouveau message">
      <div className="relative mb-3">
        <Search
          size={16}
          strokeWidth={1.7}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un habitant, une villa, une rue…"
          className="w-full rounded-md border-[1.5px] border-border bg-surface-2 py-[11px] pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        {contacts.isLoading ? (
          [0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-md" />
          ))
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-[13px] font-medium text-ink-3">
            Aucun contact trouvé.
          </p>
        ) : (
          filtered.map((c) => (
            <ContactRow key={c.id} contact={c} onClick={() => onSelect(c.id)} />
          ))
        )}
      </div>
    </BottomSheet>
  );
}

function ContactRow({
  contact,
  onClick,
}: {
  contact: MessageContact;
  onClick: () => void;
}) {
  const name = `${contact.prenom} ${contact.nom}`.trim();
  const role = contact.roles?.[0]?.code;
  const roleLabel = role ? (ROLE_LABEL[role] ?? null) : null;
  const villas = contact.villas && contact.villas.length > 0
    ? contact.villas
    : contact.villa
      ? [contact.villa]
      : [];
  const citeLabel = contact.cites?.[0] ? `Cité ${contact.cites[0]}` : null;
  const villaLabel = (v: { numero: string; rue?: string }) =>
    `Villa ${v.numero}${v.rue ? ` · ${v.rue}` : ""}`;
  const fallbackSub = roleLabel ?? (villas[0] ? villaLabel(villas[0]) : null);
  const extraVillas = villas.length > 1 ? villas.slice(1) : [];
  const fullSub = citeLabel
    ? fallbackSub
      ? `${fallbackSub} · ${citeLabel}`
      : citeLabel
    : fallbackSub;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-md bg-surface p-3 text-left shadow-card"
    >
      <Avatar name={name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-ink">{name}</div>
        <div className="truncate text-[11px] font-medium text-ink-3">
          {fullSub}
        </div>
        {extraVillas.length > 0 && (
          <div className="mt-0.5 space-y-0.5 text-[11px] font-medium text-ink-3">
            {extraVillas.map((v, i) => (
              <div key={i} className="truncate">
                {villaLabel(v)}
              </div>
            ))}
          </div>
        )}
      </div>
      <ChevronRight size={16} strokeWidth={1.7} className="text-ink-3" />
    </button>
  );
}
