import { UploadCloud } from "lucide-react";

export function UploadDropzone() {
  return (
    <section className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 p-8 text-center">
      <UploadCloud className="mx-auto h-8 w-8 text-indigo-700" />
      <h2 className="mt-3 text-base font-semibold text-zinc-950">Upload knowledge sources</h2>
      <p className="mt-1 text-sm text-zinc-600">Drop contracts, clause libraries, policy docs, or invoice exports for chunking and vector indexing.</p>
      <button className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Choose files</button>
    </section>
  );
}

export default UploadDropzone;
