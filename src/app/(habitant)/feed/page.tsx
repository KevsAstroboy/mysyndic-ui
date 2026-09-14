"use client";

import { FeedList } from "@/components/features/feed/FeedList";
import { PageHeader } from "@/components/layout/PageHeader";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useComposerStore } from "@/lib/store/composerStore";
import { isStaffRole } from "@/lib/utils/rbac";

export default function FeedPage() {
  const { profilActif } = useAuth();
  const openComposer = useComposerStore((s) => s.openFeedComposer);
  // Staff → barre sticky du RoleShell (avec le bouton +) ; habitant → TopBar sticky.
  const isStaff = isStaffRole(profilActif?.code);

  return (
    <>
      <PageHeader title="Feed" subtitle={profilActif?.citeNom ?? "Ma cité"} />
      {!isStaff && <TopBar onCompose={openComposer} />}
      <FeedList />
    </>
  );
}
