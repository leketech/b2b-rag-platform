import Link from "next/link";
import { DocumentTable } from "@/components/knowledge-base/DocumentTable";
import { EmbeddingStatus } from "@/components/knowledge-base/EmbeddingStatus";
import { RetrievalPreview } from "@/components/knowledge-base/RetrievalPreview";
import { SearchInterface } from "@/components/knowledge-base/SearchInterface";
import { PageContainer } from "@/components/layout/PageContainer";

export default function DashboardKnowledgeBasePage() {
  return (
    <PageContainer title="Knowledge base" description="Upload business documents, monitor ingestion, and inspect retrieved context before it enters AI generation." action={<Link href="/dashboard/knowledge-base/upload" className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white">Upload</Link>}>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SearchInterface />
          <DocumentTable />
        </div>
        <div className="space-y-6">
          <EmbeddingStatus />
          <RetrievalPreview />
        </div>
      </div>
    </PageContainer>
  );
}
