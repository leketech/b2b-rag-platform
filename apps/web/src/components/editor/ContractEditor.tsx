import { Toolbar } from "./Toolbar";

export function ContractEditor() {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <Toolbar />
      <article className="min-h-96 space-y-4 p-6 text-sm leading-7 text-zinc-700">
        <h2 className="text-xl font-semibold text-zinc-950">Master Services Agreement</h2>
        <p>
          This agreement governs the delivery of professional services, payment obligations, confidentiality duties, and accepted project outcomes between the parties.
        </p>
        <p>
          Payment terms are Net 30 from invoice receipt. Confidential information must be protected with commercially reasonable safeguards and used only for contract performance.
        </p>
      </article>
    </section>
  );
}

export default ContractEditor;
