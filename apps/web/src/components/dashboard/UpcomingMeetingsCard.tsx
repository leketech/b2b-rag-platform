import { CalendarClock } from "lucide-react";
import { kpis } from "@/lib/mock-data";
import { KpiCard } from "./KpiCard";

export function UpcomingMeetingsCard() {
  return (
    <KpiCard
      title="Upcoming meetings"
      value={String(kpis.upcomingMeetings)}
      detail="Nothing scheduled yet"
      icon={CalendarClock}
      accent="bg-emerald-50 text-emerald-700"
    />
  );
}

export default UpcomingMeetingsCard;
