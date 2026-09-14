import { RoleShell } from "@/components/layout/RoleShell";

export default function SyndicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleShell role="SYNDIC">{children}</RoleShell>;
}
