import { PageContainer } from "@/components/layout/PageContainer";

const sections = [
  ["Organization", "Branding, business profile, legal details, and default document identity."],
  ["Plan", "The application is free while billing is disabled. Payment settings can be added later."],
  ["Integrations", "Slack, Google Calendar, Cal.com, OpenAI, and webhook credentials."],
  ["Team management", "Roles, permissions, invitations, and approval authority."],
];

export default function DashboardSettingsPage() {
  return (
    <PageContainer title="Settings" description="Configure organization profile, integrations, team roles, and AI provider settings.">
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(([title, detail]) => (
          <section key={title} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
            <p className="mt-2 text-sm text-zinc-500">{detail}</p>
            <button className="mt-4 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Configure</button>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
