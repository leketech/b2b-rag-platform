import { AISuggestions } from "@/components/editor/AISuggestions";
import { ClauseSidebar } from "@/components/editor/ClauseSidebar";
import { ContractEditor } from "@/components/editor/ContractEditor";
import { VersionHistory } from "@/components/editor/VersionHistory";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageContainer title="Contract editor" description={`Review ${params.id}, apply AI suggestions, and export final documents.`}>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <ContractEditor />
        <div className="space-y-6">
          <AISuggestions />
          <ClauseSidebar />
          <VersionHistory />
        </div>
      </div>
    </PageContainer>
  );
}
