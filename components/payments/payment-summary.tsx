import { formatNaira } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Ledger-style breakdown. Buyers see what they paid; sellers see the fee
 * deducted and the payout they'll receive.
 */
export function PaymentSummary({
  amount,
  fee,
  perspective,
  deliveryFee = 0,
  className,
}: {
  amount: number;
  fee: number;
  perspective: "buyer" | "seller";
  deliveryFee?: number;
  className?: string;
}) {
  const rows =
    perspective === "buyer"
      ? [
          { label: "Item / service price", value: formatNaira(amount) },
          { label: "Delivery", value: deliveryFee ? formatNaira(deliveryFee) : "Free" },
          { label: "Buyer protection", value: "Free" },
        ]
      : [
          { label: "Sale price", value: formatNaira(amount) },
          { label: "Naija Market fee (5%)", value: `−${formatNaira(fee)}` },
        ];
  const total = perspective === "buyer" ? amount + deliveryFee : amount - fee;

  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between gap-4">
          <dt className="text-muted">{r.label}</dt>
          <dd className="font-medium">{r.value}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-border pt-2 text-base">
        <dt className="font-bold">{perspective === "buyer" ? "Total you pay" : "You'll receive"}</dt>
        <dd className="font-extrabold">{formatNaira(total)}</dd>
      </div>
    </dl>
  );
}
