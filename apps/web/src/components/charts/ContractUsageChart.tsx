import { SimpleBars } from "./SimpleBars";

const data = [
  { label: "NDA", value: 0, color: "bg-zinc-800" },
  { label: "MSA", value: 0, color: "bg-blue-500" },
  { label: "SOW", value: 0, color: "bg-emerald-500" },
  { label: "DPA", value: 0, color: "bg-indigo-500" },
];

export function ContractUsageChart() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Contract generation</h2>
      <p className="text-sm text-zinc-500">Template usage in the last 30 days</p>
      <SimpleBars data={data} />
    </section>
  );
}

export default ContractUsageChart;
