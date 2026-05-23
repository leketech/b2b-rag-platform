import { RetrievalPreview } from "@/components/knowledge-base/RetrievalPreview";
import { SearchInterface } from "@/components/knowledge-base/SearchInterface";
import { PageContainer } from "@/components/layout/PageContainer";

export default function KnowledgeSearchPage() {
  return (
    <PageContainer title="Search knowledge base" description="Run semantic search and inspect citations before using context in generated output.">
      <div className="space-y-6">
        <SearchInterface />
        <RetrievalPreview />
      </div>
    </PageContainer>
  );
}
