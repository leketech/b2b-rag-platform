export function TimezoneSelector() {
  return (
    <label className="block rounded-lg border border-zinc-200 bg-white p-5 text-sm font-medium text-zinc-700 shadow-sm">
      Timezone
      <select className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400">
        <option>Africa/Lagos (WAT)</option>
        <option>America/New_York (ET)</option>
        <option>Europe/London (GMT)</option>
      </select>
    </label>
  );
}

export default TimezoneSelector;
