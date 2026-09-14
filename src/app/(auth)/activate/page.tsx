import { ActivateForm } from "@/components/features/auth/ActivateForm";

export const metadata = { title: "Activation du compte — MySyndic" };

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ActivateForm initialEmail={email} />;
}
