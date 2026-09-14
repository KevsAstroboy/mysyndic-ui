import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";

export const metadata = { title: "Réinitialisation — MySyndic" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ResetPasswordForm initialEmail={email} />;
}
