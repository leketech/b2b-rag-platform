import { documents } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DocumentTable() {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Document</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Chunks</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {documents.length ? documents.map((doc) => (
            <tr key={doc.name}>
              <td className="px-4 py-3 font-medium text-zinc-950">{doc.name}</td>
              <td className="px-4 py-3 text-zinc-600">{doc.type}</td>
              <td className="px-4 py-3 text-zinc-600">{doc.chunks}</td>
              <td className="px-4 py-3"><StatusBadge status={doc.status} /></td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-zinc-500" colSpan={4}>
                No documents uploaded yet. Upload your first file to build the knowledge base.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default DocumentTable;
