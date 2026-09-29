"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { messageApi } from "@/lib/api/message";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";
import {
  htmlToMessageMarkup,
  renderMessageContent,
} from "@/lib/utils/messageContent";

export const GROUPE_THREAD_ID = "__groupe__";

export function ChatThread({
  threadId,
  title,
  otherUserId,
}: {
  threadId: string;
  title: string;
  otherUserId?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useQuery({
    queryKey: QUERY_KEYS.messages(threadId),
    queryFn: () => messageApi.thread(threadId),
    refetchInterval: 5000,
  });

  const isGroupe = threadId === GROUPE_THREAD_ID;

  // Présence du contact (messagerie privée) : rafraîchie régulièrement + push
  // socket `presence:update` (via SocketSync).
  const presence = useQuery({
    queryKey: ["presence", otherUserId],
    queryFn: () => messageApi.presence([otherUserId!]),
    enabled: !!otherUserId && !isGroupe,
    refetchInterval: 15000,
  });
  const enLigne = otherUserId ? presence.data?.[otherUserId] : undefined;

  const send = useMutation({
    mutationFn: (contenu: string) =>
      threadId === GROUPE_THREAD_ID
        ? messageApi.sendGroupe(contenu)
        : messageApi.sendPrivate(otherUserId!, contenu),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(threadId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations() });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => messageApi.remove(id),
    onSuccess: () => {
      setDeleteId(null);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(threadId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations() });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);

  // Marque le thread comme lu dès qu'un message reçu est non lu.
  // Vaut pour les conversations privées ET le groupe de la cité.
  const markingRef = useRef(false);
  useEffect(() => {
    const list = [...(messages.data ?? [])].reverse();
    const hasUnread = list.some((m) => !m.lu && m.expediteur_id !== user?.id);
    if (!hasUnread || markingRef.current) return;
    markingRef.current = true;
    messageApi
      .markThreadRead(threadId)
      .then(() => {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(threadId) });
        qc.invalidateQueries({ queryKey: QUERY_KEYS.conversations() });
      })
      .finally(() => {
        markingRef.current = false;
      });
  }, [messages.data, threadId, user?.id, qc]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (value) send.mutate(value);
  };

  // Agrandit la zone de saisie quand le texte passe sur plusieurs lignes.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData("text/html");
    if (!html) return; // collage texte brut → comportement natif
    e.preventDefault();
    const markup = htmlToMessageMarkup(html);
    const target = e.currentTarget;
    const start = target.selectionStart ?? text.length;
    const end = target.selectionEnd ?? text.length;
    const next = text.slice(0, start) + markup + text.slice(end);
    setText(next);
  };

  // Le back renvoie les messages du plus récent au plus ancien (orderBy desc).
  // On inverse pour un chat classique : les bulles récentes tout en bas.
  const list = [...(messages.data ?? [])].reverse();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg md:static md:z-auto md:mx-auto md:w-full md:max-w-3xl md:px-8 md:pb-8 md:pt-6">
      {/* En-tête */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:rounded-t-lg md:border md:border-border">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card md:hidden"
          aria-label="Retour"
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </button>
        <button
          onClick={() => router.push("/messages")}
          className="hidden items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink md:flex"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Messages
        </button>
        <div>
          <div className="text-[15px] font-bold text-ink">{title}</div>
          {!isGroupe && otherUserId ? (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  enLigne ? "bg-emerald" : "bg-ink-3/40",
                )}
              />
              <span className={enLigne ? "text-emerald" : "text-ink-3"}>
                {presence.isLoading
                  ? "…"
                  : enLigne
                    ? "En ligne"
                    : "Hors ligne"}
              </span>
            </div>
          ) : messages.isLoading ? (
            <div className="text-[11px] font-medium text-ink-3">
              Chargement…
            </div>
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 md:h-[60vh] md:min-h-[320px] md:border-x md:border-border md:bg-surface">
        {list.map((m) => {
          const mine = m.expediteur_id === user?.id;
          const senderName = `${m.expediteur?.prenom ?? ""} ${m.expediteur?.nom ?? ""}`.trim();
          const isGroup = m.est_groupe;
          return (
            <div
              key={m.id}
              className={cn("flex flex-col", mine ? "items-end" : "items-start")}
            >
              {!mine && isGroup && senderName && (
                <span className="mb-1 px-1 text-[11px] font-semibold text-ink-3">
                  {senderName}
                </span>
              )}
              <div
                className={cn(
                  "group flex max-w-[75%] items-end gap-2 md:max-w-[65%]",
                  mine ? "flex-row-reverse" : "flex-row",
                )}
              >
                {!mine && isGroup && <Avatar name={senderName} size={28} />}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5",
                    mine
                      ? "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm bg-surface text-ink shadow-card md:bg-surface-2 md:shadow-none",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
                    {renderMessageContent(m.contenu ?? "")}
                  </p>
                  <div
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-ink-3",
                    )}
                  >
                    {formatRelative(m.created_at ?? "")}
                  </div>
                </div>
                {mine && (
                  <button
                    onClick={() => setDeleteId(m.id)}
                    aria-label="Supprimer le message"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  >
                    <Trash2 size={14} strokeWidth={1.7} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-border bg-surface px-3 py-3 md:rounded-b-lg md:border md:border-t-0 md:border-border"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Écrire un message…"
          rows={1}
          className="max-h-32 min-h-[46px] flex-1 resize-none overflow-y-auto rounded-pill border-[1.5px] border-border bg-surface-2 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-3 focus:border-accent"
        />
        <button
          type="submit"
          disabled={!text.trim() || send.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
          aria-label="Envoyer"
        >
          {send.isPending ? (
            <Spinner size={16} className="text-white" />
          ) : (
            <Send size={18} strokeWidth={1.7} />
          )}
        </button>
      </form>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        loading={remove.isPending}
        message="Ce message sera supprimé pour tous les participants."
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </div>
  );
}
