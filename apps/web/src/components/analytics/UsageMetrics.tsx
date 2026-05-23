export function UsageMetrics() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">AI usage</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><dt className="text-sm text-zinc-500">Tokens</dt><dd className="text-2xl font-semibold text-zinc-950">0</dd></div>
        <div><dt className="text-sm text-zinc-500">Embeddings</dt><dd className="text-2xl font-semibold text-zinc-950">0</dd></div>
        <div><dt className="text-sm text-zinc-500">Latency</dt><dd className="text-2xl font-semibold text-zinc-950">-</dd></div>
      </dl>
    </section>
  );
}
