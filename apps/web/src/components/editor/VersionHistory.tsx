const versions = ["v4 Current draft", "v3 Legal review", "v2 AI generated", "v1 Template selected"];

export function VersionHistory() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Version history</h2>
      <ol className="mt-4 space-y-3">
        {versions.map((version) => (
          <li key={version} className="text-sm text-zinc-600">{version}</li>
        ))}
      </ol>
    </section>
  );
}

export default VersionHistory;
