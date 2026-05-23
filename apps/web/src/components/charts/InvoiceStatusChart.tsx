const data = [
  { label: "Paid", value: 0, color: "bg-emerald-500" },
  { label: "Open", value: 0, color: "bg-blue-500" },
  { label: "Overdue", value: 0, color: "bg-rose-500" },
];

export function InvoiceStatusChart() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Invoice status</h2>
      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-zinc-600">{item.label}</span>
              <span className="font-medium text-zinc-950">{item.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100">
              <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default InvoiceStatusChart;
