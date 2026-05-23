import { StatusBadge } from "@/components/ui/StatusBadge";

export function PaymentStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} />;
}

export default PaymentStatusBadge;
