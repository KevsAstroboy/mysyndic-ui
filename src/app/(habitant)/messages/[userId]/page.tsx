"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ChatThread } from "@/components/features/message/ChatThread";
import { messageApi } from "@/lib/api/message";

export default function PrivateThreadPage() {
  const { userId } = useParams<{ userId: string }>();
  const contacts = useQuery({
    queryKey: ["messages", "contacts"],
    queryFn: messageApi.contacts,
  });
  const other = contacts.data?.find((u) => u.id === userId);
  const title = other ? `${other.prenom} ${other.nom}` : "Discussion";

  return <ChatThread threadId={userId} title={title} otherUserId={userId} />;
}
