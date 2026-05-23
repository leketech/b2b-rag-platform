import { EmailTemplateEditor } from "@/components/notifications/EmailTemplateEditor";
import { RuleBuilder } from "@/components/notifications/RuleBuilder";
import { SlackPreview } from "@/components/notifications/SlackPreview";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotificationRulesPage() {
  return (
    <PageContainer title="Notification rules" description="Build triggers, delivery channels, templates, and approval routing.">
      <div className="grid gap-6 xl:grid-cols-2">
        <RuleBuilder />
        <SlackPreview />
        <EmailTemplateEditor />
      </div>
    </PageContainer>
  );
}
