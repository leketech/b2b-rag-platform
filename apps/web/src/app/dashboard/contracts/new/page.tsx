"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { contractsService } from "@/services/contracts.service";

const CONTRACT_TYPES = ["NDA", "MSA", "SoW"];

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    contract_type: "NDA",
    client_name: "",
    client_email: "",
    vendor_name: "",
    vendor_email: "",
    content: "",
    key_terms: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await contractsService.create({
        title: form.title,
        contract_type: form.contract_type,
        client: { name: form.client_name, email: form.client_email },
        vendor: { name: form.vendor_name, email: form.vendor_email },
        content: form.content,
        key_terms: form.key_terms ? { notes: form.key_terms } : {},
      });
      router.push("/dashboard/contracts");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Failed to create contract. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer
      title="New contract"
      description="Fill in the details to generate a new contract agreement."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-950">Contract details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-600 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Acme Corp NDA — June 2025"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Contract type *</label>
              <select
                value={form.contract_type}
                onChange={(e) => set("contract_type", e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {CONTRACT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-zinc-950">Client (receiving party)</h2>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Name *</label>
              <input
                required
                value={form.client_name}
                onChange={(e) => set("client_name", e.target.value)}
                placeholder="Client company name"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
              <input
                type="email"
                value={form.client_email}
                onChange={(e) => set("client_email", e.target.value)}
                placeholder="client@example.com"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-zinc-950">Vendor (your organization)</h2>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Name *</label>
              <input
                required
                value={form.vendor_name}
                onChange={(e) => set("vendor_name", e.target.value)}
                placeholder="Your company name"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Email</label>
              <input
                type="email"
                value={form.vendor_email}
                onChange={(e) => set("vendor_email", e.target.value)}
                placeholder="you@yourcompany.com"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-950">Contract content</h2>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Key terms / notes</label>
            <input
              value={form.key_terms}
              onChange={(e) => set("key_terms", e.target.value)}
              placeholder="e.g. 12-month duration, confidentiality, jurisdiction: Delaware"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Contract body</label>
            <textarea
              rows={10}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Paste or type the contract text here…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create contract"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
