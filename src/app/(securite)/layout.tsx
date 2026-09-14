import { RoleShell } from "@/components/layout/RoleShell";

export default function SecuriteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleShell role="SECURITE">{children}</RoleShell>;
}
