const checks = [
  ["API", "Operational"],
  ["Vector DB", "Operational"],
  ["Queue", "Operational"],
  ["Email", "Operational"],
];

export function SystemHealth() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">System health</h2>
      <div className="mt-4 space-y-3">
        {checks.map(([name, status]) => (
          <div key={name} className="flex items-center justify-between text-sm">
            <span className="text-zinc-700">{name}</span>
            <span className={status === "Operational" ? "text-emerald-700" : "text-amber-700"}>{status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
