import { DocumentTable } from "@/components/knowledge-base/DocumentTable";
import { EmbeddingStatus } from "@/components/knowledge-base/EmbeddingStatus";
import { UploadDropzone } from "@/components/knowledge-base/UploadDropzone";
import { PageContainer } from "@/components/layout/PageContainer";

export default function KnowledgeUploadPage() {
  return (
    <PageContainer title="Upload documents" description="Add sources to the ingestion queue and monitor chunking, embedding, and vector indexing.">
      <div className="space-y-6">
        <UploadDropzone />
        <EmbeddingStatus />
        <DocumentTable />
      </div>
    </PageContainer>
  );
}
