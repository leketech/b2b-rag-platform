import { ActiveContractsCard } from "@/components/dashboard/ActiveContractsCard";
import { NotificationActivityCard } from "@/components/dashboard/NotificationActivityCard";
import { OverdueInvoicesCard } from "@/components/dashboard/OverdueInvoicesCard";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { UpcomingMeetingsCard } from "@/components/dashboard/UpcomingMeetingsCard";
import { ContractUsageChart } from "@/components/charts/ContractUsageChart";
import { InvoiceStatusChart } from "@/components/charts/InvoiceStatusChart";
import { NotificationChart } from "@/components/charts/NotificationChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard" description="A control center for revenue, contracts, invoices, meetings, notifications, and AI retrieval health.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <RevenueCard />
        <ActiveContractsCard />
        <OverdueInvoicesCard />
        <UpcomingMeetingsCard />
        <NotificationActivityCard />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <RevenueChart />
        <InvoiceStatusChart />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ContractUsageChart />
        <NotificationChart />
      </div>
    </PageContainer>
  );
}
