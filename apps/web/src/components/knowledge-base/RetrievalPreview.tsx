const results: Array<[string, string]> = [];

export function RetrievalPreview() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Retrieval preview</h2>
      <div className="mt-4 space-y-3">
        {results.length ? results.map(([title, body]) => (
          <div key={title} className="rounded-lg bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-950">{title}</p>
            <p className="mt-1 text-sm text-zinc-600">{body}</p>
          </div>
        )) : (
          <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-500">
            Retrieved context will appear after you upload and search documents.
          </div>
        )}
      </div>
    </section>
  );
}

export default RetrievalPreview;
