type Item = {
  label: string;
  value: number;
  color?: string;
};

export function SimpleBars({ data }: { data: Item[] }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-44 w-full items-end rounded-md bg-zinc-100">
            <div
              className={`w-full rounded-md ${item.color ?? "bg-indigo-500"}`}
              style={{ height: item.value > 0 ? `${Math.max(8, (item.value / max) * 100)}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-zinc-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
