import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { OrderStatus } from "@/components/payments/order-status";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { formatDate, formatNaira, shortName } from "@/lib/formatters";
import type { Order, User } from "@/lib/types";

export function OrderCard({
  order,
  counterparty,
  role,
}: {
  order: Order;
  counterparty: User | null;
  role: "buying" | "selling";
}) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-mono font-semibold tracking-wide text-foreground">{order.id}</span>
        <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
      </div>
      <div className="mt-3 flex gap-3">
        <PlaceholderImage title={order.title} className="h-16 w-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{order.title}</h3>
          <p className="text-lg font-extrabold">{formatNaira(order.amount)}</p>
          {counterparty && (
            <p className="text-sm text-muted">
              {role === "buying" ? (order.kind === "service" ? "Provider" : "Seller") : "Buyer"}:{" "}
              {shortName(counterparty.name)}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatus status={order.status} />
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <MapPin aria-hidden className="h-3.5 w-3.5" />
            {order.fulfilment}
          </span>
        </div>
        <span className="inline-flex items-center text-sm font-semibold text-brand">
          View order
          <ChevronRight aria-hidden className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
