import { Lock, Undo2, CheckCircle2, AlertTriangle } from "lucide-react";
import { AUTO_RELEASE_DAYS } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/formatters";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The big "where is my money" card at the top of an order. */
export function HeldFundsCard({ order, perspective }: { order: Order; perspective: "buyer" | "seller" }) {
  const { status, amount } = order;
  const config = (() => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          tone: "bg-brand text-white",
          label: perspective === "buyer" ? "Paid to seller" : "Paid to your bank",
          body: "This transaction is complete.",
        };
      case "refunded":
        return {
          icon: Undo2,
          tone: "bg-foreground text-white",
          label: "Refunded to buyer",
          body: "The money was returned to the original payment method.",
        };
      case "disputed":
        return {
          icon: AlertTriangle,
          tone: "bg-danger text-white",
          label: "Held during dispute",
          body: "Money remains safely held while we review the case. Usually resolved in 2–3 working days.",
        };
      default:
        return {
          icon: Lock,
          tone: "bg-gradient-to-br from-brand to-brand-dark text-white",
          label: "Held safely by Naija Market",
          body:
            perspective === "buyer"
              ? `We release it to the seller when you confirm you got it${
                  order.autoReleaseAt
                    ? `, or automatically on ${formatDate(order.autoReleaseAt, { day: "numeric", month: "short" })} if you don't report a problem`
                    : `, or automatically ${AUTO_RELEASE_DAYS} days after hand-over if no problem is reported`
                }.`
              : `You'll be paid as soon as the buyer confirms, or automatically ${AUTO_RELEASE_DAYS} days after hand-over.`,
        };
    }
  })();
  const Icon = config.icon;

  return (
    <section aria-label="Payment status" className={cn("rounded-3xl p-5", config.tone)}>
      <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
        <Icon aria-hidden className="h-4 w-4" />
        {config.label}
      </div>
      <p className="mt-1 text-4xl font-extrabold tracking-tight">{formatNaira(amount)}</p>
      <p className="mt-2 text-sm leading-relaxed opacity-90">{config.body}</p>
    </section>
  );
}
