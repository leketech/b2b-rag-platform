import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { PageContainer } from "@/components/layout/PageContainer";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageContainer title={params.id} description="Invoice status, payment tracking, PDF preview, and delivery actions.">
      <InvoicePreview />
    </PageContainer>
  );
}
