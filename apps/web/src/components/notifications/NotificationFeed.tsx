const notifications = [
  ["Invoice reminder sent", "Email", "2 min ago"],
  ["Contract approval requested", "Slack", "18 min ago"],
  ["Webhook delivered", "Webhook", "1 hour ago"],
];

export function NotificationFeed() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Notification feed</h2>
      <div className="mt-4 divide-y divide-zinc-100">
        {notifications.map(([title, channel, time]) => (
          <div key={title} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium text-zinc-800">{title}</p>
              <p className="text-zinc-500">{channel}</p>
            </div>
            <span className="text-xs text-zinc-500">{time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default NotificationFeed;
