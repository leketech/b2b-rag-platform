export function MeetingScheduler() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Natural language scheduler</h2>
      <textarea className="mt-4 min-h-28 w-full rounded-lg border border-zinc-200 p-3 text-sm outline-none focus:border-indigo-400" defaultValue="Schedule a 45-minute legal review next Tuesday at 2pm" />
      <button className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Parse request</button>
    </section>
  );
}

export default MeetingScheduler;
