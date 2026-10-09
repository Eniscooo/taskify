import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUS_META } from "@/lib/constants";
import type { PaymentStatus } from "@/lib/types";

export function OrderStatus({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = PAYMENT_STATUS_META[status];
  return (
    <Badge tone={meta.tone} dot className={className}>
      {meta.label}
    </Badge>
  );
}
