const items: Array<[string, number, number]> = [];

export function LineItemsTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white">
          {items.length ? items.map(([name, qty, amount]) => (
            <tr key={String(name)}>
              <td className="px-4 py-3 text-zinc-800">{name}</td>
              <td className="px-4 py-3 text-zinc-600">{qty}</td>
              <td className="px-4 py-3 text-right font-medium text-zinc-950">${Number(amount).toLocaleString()}</td>
            </tr>
          )) : (
            <tr>
              <td className="px-4 py-6 text-center text-zinc-500" colSpan={3}>
                Add line items to build this invoice.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LineItemsTable;
