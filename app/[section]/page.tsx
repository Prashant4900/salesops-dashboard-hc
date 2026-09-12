import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { OverviewSection } from "@/components/dashboard/sections/overview";
import { PipelineSection } from "@/components/dashboard/sections/pipeline";
import { DealsSection } from "@/components/dashboard/sections/deals";
import { CustomersSection } from "@/components/dashboard/sections/customers";
import { TeamSection } from "@/components/dashboard/sections/team";
import { ForecastingSection } from "@/components/dashboard/sections/forecasting";
import { ReportsSection } from "@/components/dashboard/sections/reports";
import { SettingsSection } from "@/components/dashboard/sections/settings";
import type { Section } from "@/lib/dashboard-config";

const sectionComponents = {
  overview: OverviewSection,
  pipeline: PipelineSection,
  deals: DealsSection,
  customers: CustomersSection,
  team: TeamSection,
  forecasting: ForecastingSection,
  reports: ReportsSection,
  settings: SettingsSection,
} satisfies Record<Section, React.ComponentType>;

export function generateStaticParams() {
  return Object.keys(sectionComponents).map((section) => ({ section }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!(section in sectionComponents)) {
    notFound();
  }

  const activeSection = section as Section;
  const SectionComponent = sectionComponents[activeSection];

  return (
    <DashboardShell activeSection={activeSection}>
      <SectionComponent />
    </DashboardShell>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = section in sectionComponents
    ? section.charAt(0).toUpperCase() + section.slice(1)
    : "Dashboard";

  return { title: `${title} | SalesOps Dashboard` };
}

export const dynamicParams = false;

