export function EmbeddingStatus() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Embedding status</h2>
      <div className="mt-4 h-2 rounded-full bg-zinc-100">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: "78%" }} />
      </div>
      <p className="mt-2 text-sm text-zinc-500">241 of 309 chunks indexed</p>
    </section>
  );
}

export default EmbeddingStatus;
