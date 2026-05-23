const logs = [
  "Parsed governing law: New York",
  "Selected high confidentiality clause preset",
  "Applied Net 30 payment language",
  "Queued editor suggestions for liability cap",
];

export function GenerationLogs() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-white">Generation logs</h2>
      <div className="mt-4 space-y-2 font-mono text-xs text-zinc-300">
        {logs.map((log) => (
          <p key={log}>$ {log}</p>
        ))}
      </div>
    </section>
  );
}

export default GenerationLogs;
