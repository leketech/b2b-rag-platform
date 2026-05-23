import { AIUsageChart } from "@/components/analytics/AIUsageChart";
import { RevenueMetrics } from "@/components/analytics/RevenueMetrics";
import { SystemHealth } from "@/components/analytics/SystemHealth";
import { UsageMetrics } from "@/components/analytics/UsageMetrics";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardAnalyticsPage() {
  return (
    <PageContainer title="Analytics" description="Track revenue, contract volume, customer workflows, AI usage, and platform health.">
      <div className="space-y-6">
        <UsageMetrics />
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <RevenueMetrics />
          <SystemHealth />
        </div>
        <AIUsageChart />
      </div>
    </PageContainer>
  );
}
