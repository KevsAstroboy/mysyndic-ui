import { QuartierTabs } from "@/components/features/quartier/QuartierTabs";
import { PageHeader } from "@/components/layout/PageHeader";

export default function QuartierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Vie du quartier"
        subtitle="Incidents, annonces, alertes et conflits de votre cité"
      />
      <div className="mx-auto w-full max-w-6xl md:px-8">
        <div className="px-5 pb-1 pt-4 md:hidden">
          <h1 className="text-[22px] font-extrabold tracking-[-.4px] text-ink">
            Vie du quartier
          </h1>
        </div>
        <QuartierTabs />
        {children}
      </div>
    </>
  );
}
