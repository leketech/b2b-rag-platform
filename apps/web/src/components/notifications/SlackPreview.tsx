export function SlackPreview() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Slack preview</h2>
      <div className="mt-4 rounded-lg bg-zinc-950 p-4 text-sm text-zinc-200">
        <p className="font-medium text-white">#workspace</p>
        <p className="mt-2">Your first notification preview will appear here after you create a workflow.</p>
      </div>
    </section>
  );
}

export default SlackPreview;
