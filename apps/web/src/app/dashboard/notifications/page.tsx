"use client";

import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { remindersService } from "@/services/notifications.service";

type Reminder = {
  id: string;
  subject: string;
  body: string;
  channel: string;
  recipient: string;
  status: string;
  sent_at: string;
};

const CHANNELS = ["email", "slack", "sms"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  sent: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
};

export default function NotificationsPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    channel: "email" as typeof CHANNELS[number],
    recipient: "",
    remind_at: "",
    remind_time: "09:00",
  });

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function load() {
    setLoading(true);
    try {
      const res = await remindersService.list();
      setReminders(res.data);
    } catch {
      setError("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.remind_at) { setFormError("Please set a reminder date."); return; }
    setSubmitting(true);
    try {
      await remindersService.create({
        title: form.title,
        message: form.message,
        channel: form.channel,
        recipient: form.recipient,
        remind_at: `${form.remind_at}T${form.remind_time}:00`,
      });
      setForm({ title: "", message: "", channel: "email", recipient: "", remind_at: "", remind_time: "09:00" });
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setFormError(msg || "Failed to create reminder.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remindersService.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // silent — the item will still show
    }
  }

  return (
    <PageContainer
      title="Reminders"
      description="Schedule email, Slack, and SMS notifications for contracts, invoices, and meetings."
      action={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          {showForm ? "Cancel" : "New reminder"}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4"
          >
            <h2 className="text-sm font-semibold text-zinc-950">New reminder</h2>
            {formError && (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Invoice #INV-001 due in 3 days"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-600 mb-1">Message</label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  placeholder="Message body for the notification…"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Channel</label>
                <select
                  value={form.channel}
                  onChange={(e) => setField("channel", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Recipient *</label>
                <input
                  required
                  value={form.recipient}
                  onChange={(e) => setField("recipient", e.target.value)}
                  placeholder={form.channel === "slack" ? "#channel or @user" : "email or phone"}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Reminder date *</label>
                <input
                  type="date"
                  value={form.remind_at}
                  onChange={(e) => setField("remind_at", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Time</label>
                <input
                  type="time"
                  value={form.remind_time}
                  onChange={(e) => setField("remind_time", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Create reminder"}
              </button>
            </div>
          </form>
        )}

        {/* Reminders list */}
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">Loading reminders…</div>
          ) : error ? (
            <div className="px-4 py-12 text-center text-sm text-red-500">{error}</div>
          ) : reminders.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Bell className="mx-auto h-8 w-8 text-zinc-300 mb-3" />
              <p className="text-sm text-zinc-500">No reminders yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
              >
                Create your first reminder →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Channel</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Recipient</th>
                    <th className="px-4 py-3 font-medium">Scheduled</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {reminders.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-950">{r.subject}</p>
                        {r.body && <p className="text-xs text-zinc-500 truncate max-w-[200px]">{r.body}</p>}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 capitalize hidden sm:table-cell">{r.channel}</td>
                      <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{r.recipient}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        {r.sent_at ? new Date(r.sent_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "pending" && (
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                            title="Delete reminder"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
