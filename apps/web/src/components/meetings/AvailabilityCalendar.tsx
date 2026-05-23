const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = ["9", "10", "11", "1", "2", "3", "4"];

export function AvailabilityCalendar() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Availability heatmap</h2>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {days.map((day) => (
          <div key={day}>
            <p className="mb-2 text-center text-xs font-medium text-zinc-500">{day}</p>
            <div className="space-y-2">
              {slots.map((slot, index) => (
                <div key={`${day}-${slot}`} className={`h-9 rounded-md ${index % 3 === 0 ? "bg-emerald-200" : index % 2 === 0 ? "bg-blue-100" : "bg-zinc-100"}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AvailabilityCalendar;
