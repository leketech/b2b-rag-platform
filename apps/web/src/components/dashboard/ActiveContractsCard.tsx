import { FileCheck2 } from "lucide-react";
import { kpis } from "@/lib/mock-data";
import { KpiCard } from "./KpiCard";

export function ActiveContractsCard() {
  return (
    <KpiCard
      title="Active contracts"
      value={String(kpis.activeContracts)}
      detail="Create your first contract"
      icon={FileCheck2}
      accent="bg-blue-50 text-blue-700"
    />
  );
}

export default ActiveContractsCard;
