import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Ready: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Indexed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Review: "bg-blue-50 text-blue-700 ring-blue-200",
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  Draft: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  Queued: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  Embedding: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1", toneMap[status] ?? toneMap.Draft, className)}>
      {status}
    </span>
  );
}
