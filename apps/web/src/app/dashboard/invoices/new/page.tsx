"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { invoicesService } from "@/services/invoices.service";

type LineItem = { description: string; quantity: number; unit_price: number };

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

function formatCurrency(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    currency: "USD",
    tax_rate: "0",
    due_date: "",
    notes: "",
  });

  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setItem(i: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, [field]: field === "description" ? value : Number(value) } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const taxAmount = subtotal * (Number(form.tax_rate) / 100);
  const total = subtotal + taxAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await invoicesService.create({
        client_name: form.client_name,
        client_email: form.client_email,
        line_items: items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.quantity * it.unit_price,
        })),
        tax_rate: Number(form.tax_rate),
        currency: form.currency,
        due_date: form.due_date || undefined,
        notes: form.notes,
      });
      router.push("/dashboard/invoices");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="New invoice" description="Build invoice details, line items, and tax.">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: form */}
          <div className="space-y-6">
            {/* Client */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-zinc-950">Bill to</h2>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Client name *</label>
                <input
                  required
                  value={form.client_name}
                  onChange={(e) => setField("client_name", e.target.value)}
                  placeholder="Client company or person"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Client email</label>
                <input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setField("client_email", e.target.value)}
                  placeholder="client@example.com"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setField("currency", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Due date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setField("due_date", e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
              <h2 className="text-sm font-semibold text-zinc-950">Line items</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500">
                      <th className="pb-2 font-medium">Description</th>
                      <th className="pb-2 font-medium w-16">Qty</th>
                      <th className="pb-2 font-medium w-24">Unit price</th>
                      <th className="pb-2 font-medium w-20 text-right">Total</th>
                      <th className="pb-2 w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2 pr-2">
                          <input
                            required
                            value={item.description}
                            onChange={(e) => setItem(i, "description", e.target.value)}
                            placeholder="Service or product"
                            className="w-full rounded border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => setItem(i, "quantity", e.target.value)}
                            className="w-full rounded border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => setItem(i, "unit_price", e.target.value)}
                            className="w-full rounded border border-zinc-200 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 pr-2 text-right text-zinc-700 font-medium">
                          {formatCurrency(item.quantity * item.unit_price, form.currency)}
                        </td>
                        <td className="py-2">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(i)}
                              className="text-zinc-400 hover:text-red-500 text-lg leading-none"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-indigo-600 hover:underline"
              >
                + Add line item
              </button>
            </div>

            {/* Notes */}
            <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <label className="block text-xs font-medium text-zinc-600 mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Payment terms, bank details, etc."
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Right: preview / summary */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm h-fit sticky top-24 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-950">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, form.currency)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <span>Tax</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.tax_rate}
                  onChange={(e) => setField("tax_rate", e.target.value)}
                  className="ml-auto w-16 rounded border border-zinc-200 px-2 py-1 text-right text-sm outline-none focus:border-indigo-500"
                />
                <span>%</span>
                <span className="ml-2 text-zinc-700">{formatCurrency(taxAmount, form.currency)}</span>
              </div>
              <div className="border-t border-zinc-100 pt-2 flex justify-between font-semibold text-zinc-950">
                <span>Total</span>
                <span>{formatCurrency(total, form.currency)}</span>
              </div>
            </div>

            {form.client_name && (
              <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 space-y-1">
                <p className="font-medium text-zinc-950">Bill to</p>
                <p>{form.client_name}</p>
                {form.client_email && <p>{form.client_email}</p>}
                {form.due_date && (
                  <p>Due {new Date(form.due_date).toLocaleDateString()}</p>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create invoice"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
