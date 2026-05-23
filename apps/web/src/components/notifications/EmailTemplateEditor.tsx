export function EmailTemplateEditor() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Email template</h2>
      <input className="mt-4 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" defaultValue="Action required: {{contract_name}}" />
      <textarea className="mt-3 min-h-32 w-full rounded-lg border border-zinc-200 p-3 text-sm" defaultValue="A contract needs your review. Open the approval workspace to inspect AI suggestions and retrieved clauses." />
    </section>
  );
}

export default EmailTemplateEditor;
