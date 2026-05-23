"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { meetingsService } from "@/services/meetings.service";

type Attendee = { name: string; email: string };

export default function NewMeetingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "10:00",
    duration_minutes: "30",
    location: "",
    notes: "",
  });

  const [attendees, setAttendees] = useState<Attendee[]>([{ name: "", email: "" }]);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setAttendee(i: number, field: keyof Attendee, value: string) {
    setAttendees((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a))
    );
  }

  function addAttendee() {
    setAttendees((prev) => [...prev, { name: "", email: "" }]);
  }

  function removeAttendee(i: number) {
    setAttendees((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.date) {
      setError("Please select a date.");
      return;
    }
    setLoading(true);
    try {
      const scheduled_at = `${form.date}T${form.time}:00`;
      await meetingsService.schedule({
        title: form.title,
        scheduled_at,
        duration_minutes: Number(form.duration_minutes),
        location: form.location,
        attendees: attendees.filter((a) => a.name.trim()),
        notes: form.notes,
      });
      router.push("/dashboard/meetings");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="Schedule meeting" description="Set up a meeting and invite attendees.">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Meeting details */}
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-zinc-950">Meeting details</h2>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Q3 Contract Review"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setField("date", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setField("time", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Duration (min)</label>
                  <select
                    value={form.duration_minutes}
                    onChange={(e) => setField("duration_minutes", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {[15, 30, 45, 60, 90, 120].map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Location / link</label>
                  <input
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    placeholder="Zoom link or room"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Agenda, topics, preparation notes…"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Attendees + preview */}
          <div className="space-y-6">
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-zinc-950">Attendees</h2>
              <div className="space-y-3">
                {attendees.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={a.name}
                      onChange={(e) => setAttendee(i, "name", e.target.value)}
                      placeholder="Name"
                      className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="email"
                      value={a.email}
                      onChange={(e) => setAttendee(i, "email", e.target.value)}
                      placeholder="Email"
                      className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    {attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(i)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addAttendee}
                className="text-sm text-indigo-600 hover:underline"
              >
                + Add attendee
              </button>
            </div>

            {/* Preview card */}
            {form.title && form.date && (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preview</p>
                <p className="font-semibold text-zinc-950">{form.title}</p>
                <p className="text-sm text-zinc-600">
                  {new Date(`${form.date}T${form.time}`).toLocaleString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })} · {form.duration_minutes} min
                </p>
                {form.location && <p className="text-sm text-zinc-500">{form.location}</p>}
                {attendees.filter((a) => a.name).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {attendees.filter((a) => a.name).map((a, i) => (
                      <span key={i} className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700">
                        {a.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Scheduling…" : "Schedule meeting"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
