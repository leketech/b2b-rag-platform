import { LineItemsTable } from "./LineItemsTable";
import { TaxCalculator } from "./TaxCalculator";

export function InvoicePreview() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-950">Invoice preview</h2>
          <p className="text-sm text-zinc-500">INV-1051 · Due May 30</p>
        </div>
        <span className="rounded-lg bg-zinc-950 px-3 py-1 text-sm font-medium text-white">Draft</span>
      </div>
      <LineItemsTable />
      <div className="mt-5 max-w-sm sm:ml-auto">
        <TaxCalculator />
      </div>
    </section>
  );
}

export default InvoicePreview;
