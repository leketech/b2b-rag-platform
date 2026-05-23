import { SimpleBars } from "@/components/charts/SimpleBars";

export function AIUsageChart() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">AI workload</h2>
      <SimpleBars data={[
        { label: "Draft", value: 0, color: "bg-indigo-600" },
        { label: "Search", value: 0, color: "bg-blue-500" },
        { label: "Embed", value: 0, color: "bg-emerald-500" },
        { label: "Summ", value: 0, color: "bg-zinc-800" },
      ]} />
    </section>
  );
}
