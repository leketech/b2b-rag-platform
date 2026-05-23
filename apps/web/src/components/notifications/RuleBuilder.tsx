export function RuleBuilder() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Rule builder</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select className="h-10 rounded-lg border border-zinc-200 px-3 text-sm"><option>Invoice overdue</option><option>Contract approved</option></select>
        <select className="h-10 rounded-lg border border-zinc-200 px-3 text-sm"><option>Send email</option><option>Post to Slack</option><option>Call webhook</option></select>
        <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Create rule</button>
      </div>
    </section>
  );
}

export default RuleBuilder;
