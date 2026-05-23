export function PartyDetailsForm() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Party details</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {["Counterparty name", "Counterparty email", "Contract owner", "Approval group"].map((label) => (
          <label key={label} className="text-sm font-medium text-zinc-700">
            {label}
            <input className="mt-1 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400" placeholder={label} />
          </label>
        ))}
      </div>
    </section>
  );
}

export default PartyDetailsForm;
