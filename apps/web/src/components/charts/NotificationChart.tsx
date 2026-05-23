const channels = [
  ["Email", 0, "bg-blue-500"],
  ["Slack", 0, "bg-emerald-500"],
  ["SMS", 0, "bg-zinc-700"],
  ["Webhook", 0, "bg-indigo-500"],
];

export function NotificationChart() {
  const max = Math.max(1, ...channels.map(([, value]) => Number(value)));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Notification delivery</h2>
      <div className="mt-5 space-y-3">
        {channels.map(([label, value, color]) => (
          <div key={String(label)} className="grid grid-cols-[80px_1fr_56px] items-center gap-3 text-sm">
            <span className="text-zinc-600">{label}</span>
            <div className="h-2 rounded-full bg-zinc-100">
              <div className={`h-2 rounded-full ${color}`} style={{ width: `${(Number(value) / max) * 100}%` }} />
            </div>
            <span className="text-right font-medium text-zinc-950">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NotificationChart;
