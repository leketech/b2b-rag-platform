const attendees = ["legal@company.com", "sales@company.com", "client@acme.com"];

export function AttendeesManager() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Attendees</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {attendees.map((attendee) => (
          <span key={attendee} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">{attendee}</span>
        ))}
      </div>
    </section>
  );
}

export default AttendeesManager;
