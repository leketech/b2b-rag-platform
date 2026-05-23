const clauses = ["Payment", "Confidentiality", "Data protection", "Termination", "Liability"];

export function ClauseSidebar() {
  return (
    <aside className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Clause library</h2>
      <div className="mt-4 space-y-2">
        {clauses.map((clause) => (
          <button key={clause} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50">
            {clause}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default ClauseSidebar;
