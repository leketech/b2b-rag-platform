export function MeetingPreview() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Meeting preview</h2>
      <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700">
        <p className="font-medium text-zinc-950">Legal review</p>
        <p className="mt-1">Tuesday · 2:00 PM · 45 minutes</p>
        <p className="mt-1">Agenda generated from contract review context.</p>
      </div>
    </section>
  );
}

export default MeetingPreview;
