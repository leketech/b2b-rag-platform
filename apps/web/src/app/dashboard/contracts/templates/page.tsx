import { ContractTypeSelector } from "@/components/contracts/ContractTypeSelector";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ContractTemplatesPage() {
  return (
    <PageContainer title="Contract templates" description="Curated agreement starters with AI recommendations and approved clause presets.">
      <ContractTypeSelector />
    </PageContainer>
  );
}
