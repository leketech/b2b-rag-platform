import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent?: string;
};

export function KpiCard({ title, value, detail, icon: Icon, accent = "bg-indigo-50 text-indigo-700" }: KpiCardProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{detail}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
