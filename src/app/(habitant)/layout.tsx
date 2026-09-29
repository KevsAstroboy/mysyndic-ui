"use client";

import { RoleShell } from "@/components/layout/RoleShell";
import { ScrollMain } from "@/components/layout/ScrollMain";
import { FABUrgence } from "@/components/features/alerte/FABUrgence";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/hooks/useAuth";

// Profil d'équipe → le shell suit le rôle actif, pas le dossier de route.
// Les routes partagées (messages, profil, quartier) servent donc aussi le
// syndic/l'admin/la sécurité sous leur propre boîte.
const ROLE_FOR: Record<string, "SYNDIC" | "ADMIN" | "SUPER_ADMIN" | "SECURITE"> = {
  SYNDIC: "SYNDIC",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  CHEF_SECURITE: "SECURITE",
};

export default function HabitantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profilActif } = useAuth();
  const role = profilActif?.code ? ROLE_FOR[profilActif.code] : undefined;

  if (role) {
    return <RoleShell role={role}>{children}</RoleShell>;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ScrollMain className="flex-1 overflow-y-auto overflow-x-clip pb-[82px] md:pb-0">
          {children}
        </ScrollMain>
      </div>
      <BottomNav />
      <FABUrgence />
    </div>
  );
}
