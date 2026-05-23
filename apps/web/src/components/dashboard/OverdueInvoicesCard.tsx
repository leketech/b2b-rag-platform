import { AlertTriangle } from "lucide-react";
import { kpis } from "@/lib/mock-data";
import { KpiCard } from "./KpiCard";

export function OverdueInvoicesCard() {
  return (
    <KpiCard
      title="Overdue invoices"
      value={String(kpis.overdueInvoices)}
      detail="No overdue invoices"
      icon={AlertTriangle}
      accent="bg-rose-50 text-rose-700"
    />
  );
}

export default OverdueInvoicesCard;
