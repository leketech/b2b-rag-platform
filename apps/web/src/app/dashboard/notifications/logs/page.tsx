import { DeliveryLogs } from "@/components/notifications/DeliveryLogs";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotificationLogsPage() {
  return (
    <PageContainer title="Delivery logs" description="Audit notification attempts, retries, failures, and channel health.">
      <DeliveryLogs />
    </PageContainer>
  );
}
