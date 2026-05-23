import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { kpis } from "@/lib/mock-data";
import { KpiCard } from "./KpiCard";

export function RevenueCard() {
  return <KpiCard title="Revenue" value={formatCurrency(kpis.revenue)} detail="No invoices yet" icon={DollarSign} />;
}

export default RevenueCard;
