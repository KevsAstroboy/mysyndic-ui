"use client";

import { ChatThread, GROUPE_THREAD_ID } from "@/components/features/message/ChatThread";
import { useAuth } from "@/lib/hooks/useAuth";

export default function GroupeThreadPage() {
  const { profilActif } = useAuth();
  const title = profilActif?.citeNom ?? "Groupe de la cité";

  return <ChatThread threadId={GROUPE_THREAD_ID} title={title} />;
}
