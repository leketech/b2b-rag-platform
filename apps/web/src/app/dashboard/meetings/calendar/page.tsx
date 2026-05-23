import { AvailabilityCalendar } from "@/components/meetings/AvailabilityCalendar";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CalendarPage() {
  return (
    <PageContainer title="Calendar" description="Week view with availability signals and timezone-aware scheduling blocks.">
      <AvailabilityCalendar />
    </PageContainer>
  );
}
