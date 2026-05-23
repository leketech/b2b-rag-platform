"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { contractsService } from "@/services/contracts.service";

type Contract = {
  id: string;
  title: string;
  contract_type: string;
  status: string;
  parties: { client?: { name: string }; vendor?: { name: string } };
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  sent: "bg-blue-50 text-blue-700",
  signed: "bg-emerald-50 text-emerald-700",
  expired: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    contractsService
      .list()
      .then((res) => setContracts(res.data))
      .catch(() => setError("Failed to load contracts."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer
      title="Contracts"
      description="Generate, review, and deliver AI-assisted agreements."
      action={
        <Link
          href="/dashboard/contracts/new"
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          New contract
        </Link>
      }
    >
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm text-zinc-500">Loading contracts…</div>
        ) : error ? (
          <div className="px-4 py-12 text-center text-sm text-red-500">{error}</div>
        ) : contracts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-zinc-500">No contracts yet.</p>
            <Link
              href="/dashboard/contracts/new"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Create your first contract →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Client</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/contracts/${c.id}`}
                        className="font-medium text-zinc-950 hover:text-indigo-700"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{c.contract_type}</td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                      {c.parties?.client?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[c.status] ?? "bg-zinc-100 text-zinc-700"}`}
                      >
                        {c.status}
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
