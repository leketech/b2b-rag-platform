const logs = [
  ["Email", "Delivered", "2026-05-09 09:14"],
  ["Slack", "Delivered", "2026-05-09 09:12"],
  ["Webhook", "Retried", "2026-05-09 08:50"],
];

export function DeliveryLogs() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Delivery logs</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-zinc-100">
            {logs.map(([channel, status, time]) => (
              <tr key={`${channel}-${time}`}>
                <td className="px-4 py-3 text-zinc-700">{channel}</td>
                <td className="px-4 py-3 font-medium text-zinc-950">{status}</td>
                <td className="px-4 py-3 text-right text-zinc-500">{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DeliveryLogs;
