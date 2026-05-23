export function ConfidenceScore({ value = 92 }: { value?: number }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Confidence score</h2>
      <div className="mt-5 flex items-end gap-3">
        <span className="text-4xl font-semibold text-zinc-950">{value}%</span>
        <span className="pb-1 text-sm text-zinc-500">grounded in approved sources</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
    </section>
  );
}

export default ConfidenceScore;
