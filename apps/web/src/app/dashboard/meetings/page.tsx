"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { meetingsService } from "@/services/meetings.service";

type Meeting = {
  id: string;
  title: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  attendees: { name: string; email?: string }[];
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-zinc-100 text-zinc-600",
};

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    meetingsService
      .list()
      .then((res) => setMeetings(res.data))
      .catch(() => setError("Failed to load meetings."))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = meetings.filter((m) => new Date(m.scheduled_at) >= new Date() && m.status !== "cancelled");
  const past = meetings.filter((m) => new Date(m.scheduled_at) < new Date() || m.status === "completed");

  return (
    <PageContainer
      title="Meetings"
      description="Schedule reviews, sync attendees, and manage your calendar."
      action={
        <Link
          href="/dashboard/meetings/new"
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          Schedule meeting
        </Link>
      }
    >
      {loading ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-12 text-center text-sm text-zinc-500 shadow-sm">
          Loading meetings…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-12 text-center text-sm text-red-500">
          {error}
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-12 text-center shadow-sm">
          <Calendar className="mx-auto h-8 w-8 text-zinc-300 mb-3" />
          <p className="text-sm text-zinc-500">No meetings scheduled yet.</p>
          <Link
            href="/dashboard/meetings/new"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Schedule your first meeting →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Upcoming</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {upcoming.map((m) => (
                  <MeetingCard key={m.id} meeting={m} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Past</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {past.map((m) => (
                  <MeetingCard key={m.id} meeting={m} dimmed />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}

function MeetingCard({ meeting, dimmed }: { meeting: Meeting; dimmed?: boolean }) {
  return (
    <div className={`rounded-lg border border-zinc-200 bg-white p-4 shadow-sm space-y-3 ${dimmed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-zinc-950 text-sm leading-snug">{meeting.title}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[meeting.status] ?? "bg-zinc-100 text-zinc-600"}`}>
          {meeting.status}
        </span>
      </div>
      <div className="space-y-1 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDateTime(meeting.scheduled_at)} · {meeting.duration_minutes} min</span>
        </div>
        {meeting.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{meeting.location}</span>
          </div>
        )}
        {meeting.attendees?.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}
