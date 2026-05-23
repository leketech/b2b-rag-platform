const steps = ["Intent parsed", "Clauses retrieved", "Terms validated", "Draft assembled"];

export function AIProgress() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">AI generation progress</h2>
      <div className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">{index + 1}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-800">{step}</p>
              <div className="mt-1 h-1.5 rounded-full bg-zinc-100">
                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${85 - index * 8}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AIProgress;
