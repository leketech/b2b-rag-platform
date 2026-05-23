import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react";

const templates = [
  { name: "Master Services Agreement", detail: "Best for recurring B2B delivery and commercial terms.", badge: "Popular" },
  { name: "Mutual NDA", detail: "Balanced confidentiality terms with jurisdiction presets.", badge: "AI pick" },
  { name: "Statement of Work", detail: "Project scope, milestones, acceptance, and payment schedule.", badge: "Fast" },
];

export function ContractTypeSelector() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {templates.map((template) => (
        <button key={template.name} className="group rounded-lg border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">{template.badge}</span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-950">{template.name}</h3>
          <p className="mt-2 min-h-12 text-sm text-zinc-500">{template.detail}</p>
          <div className="mt-4 flex items-center justify-between text-sm font-medium text-indigo-700">
            Configure
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </button>
      ))}
      <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/60 p-5">
        <Sparkles className="h-5 w-5 text-indigo-700" />
        <h3 className="mt-3 text-sm font-semibold text-zinc-950">AI recommendation</h3>
        <p className="mt-2 text-sm text-zinc-600">Upload a brief or paste deal context and the system will recommend the template, clause set, and approval path.</p>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Uses your indexed clause library
        </div>
      </div>
    </div>
  );
}

export default ContractTypeSelector;
