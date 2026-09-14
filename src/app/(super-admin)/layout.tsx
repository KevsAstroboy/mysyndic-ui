import { RoleShell } from "@/components/layout/RoleShell";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleShell role="SUPER_ADMIN">{children}</RoleShell>;
}
