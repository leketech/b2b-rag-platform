const clauses = [
  ["Confidentiality", "0.94 match"],
  ["Payment terms", "0.91 match"],
  ["Limitation of liability", "0.88 match"],
];

export function ClauseRetrieval() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Retrieved clauses</h2>
      <div className="mt-4 space-y-3">
        {clauses.map(([name, score]) => (
          <div key={name} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2">
            <span className="text-sm text-zinc-700">{name}</span>
            <span className="text-xs font-medium text-indigo-700">{score}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ClauseRetrieval;
