"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { invoicesService } from "@/services/invoices.service";

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  client_info: { name?: string; email?: string };
  total: number;
  currency: string;
  due_date: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  sent: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-red-50 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-400",
};

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    invoicesService
      .list()
      .then((res) => setInvoices(res.data))
      .catch(() => setError("Failed to load invoices."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer
      title="Invoices"
      description="Create invoices, track payment status, and manage billing."
      action={
        <Link
          href="/dashboard/invoices/new"
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          New invoice
        </Link>
      }
    >
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-zinc-500">Loading invoices…</div>
        ) : error ? (
          <div className="px-4 py-12 text-center text-sm text-red-500">{error}</div>
        ) : invoices.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-zinc-500">No invoices yet.</p>
            <Link
              href="/dashboard/invoices/new"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/invoices/${inv.id}`}
                        className="font-medium text-zinc-950 hover:text-indigo-700"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                      {inv.client_info?.name || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-950">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[inv.status] ?? "bg-zinc-100 text-zinc-700"}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
