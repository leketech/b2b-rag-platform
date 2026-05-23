import { revenueTrend } from "@/lib/mock-data";
import { SimpleBars } from "./SimpleBars";

export function RevenueChart() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-zinc-950">Revenue trend</h2>
        <p className="text-sm text-zinc-500">Paid invoice volume by month</p>
      </div>
      <SimpleBars data={revenueTrend.map((item) => ({ label: item.label, value: item.paid, color: "bg-indigo-600" }))} />
    </section>
  );
}

export default RevenueChart;
