import { Radio } from "lucide-react";
import { kpis } from "@/lib/mock-data";
import { KpiCard } from "./KpiCard";

export function NotificationActivityCard() {
  return (
    <KpiCard
      title="Notification activity"
      value={`${kpis.notificationActivity}%`}
      detail="No notifications sent yet"
      icon={Radio}
      accent="bg-violet-50 text-violet-700"
    />
  );
}

export default NotificationActivityCard;
