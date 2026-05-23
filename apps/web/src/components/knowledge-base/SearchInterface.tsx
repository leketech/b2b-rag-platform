export function SearchInterface() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Semantic search</h2>
      <div className="mt-4 flex gap-2">
        <input className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400" defaultValue="liability cap for enterprise services" />
        <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Search</button>
      </div>
    </section>
  );
}

export default SearchInterface;
