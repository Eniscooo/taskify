"use client";

import Link from "next/link";
import { OrderStatus } from "@/components/payments/order-status";
import { Button } from "@/components/ui/button";
import { PAYMENT_STATUS_META } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/formatters";
import type { Order, PaymentStatus } from "@/lib/types";
import { DataTable, type Column } from "./data-table";
import { useModeration } from "./use-moderation";

const columns: Column<Order>[] = [
  {
    key: "id",
    header: "Order",
    sortValue: (o) => o.id,
    render: (o) => (
      <Link href={`/orders/${o.id}`} className="font-mono font-semibold hover:underline">
        {o.id}
      </Link>
    ),
  },
  { key: "title", header: "Item / service", render: (o) => <span className="block max-w-56 truncate">{o.title}</span> },
  { key: "kind", header: "Type", render: (o) => (o.kind === "item" ? "Item" : "Service") },
  { key: "amount", header: "Amount", sortValue: (o) => o.amount, render: (o) => <span className="font-semibold">{formatNaira(o.amount)}</span> },
  { key: "fee", header: "Fee", sortValue: (o) => o.fee, render: (o) => formatNaira(o.fee) },
  { key: "date", header: "Date", sortValue: (o) => o.createdAt, render: (o) => formatDate(o.createdAt) },
  { key: "status", header: "Status", sortValue: (o) => o.status, render: (o) => <OrderStatus status={o.status} /> },
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const { rows, update } = useModeration(orders);
  return (
    <DataTable
      label="Orders"
      rows={rows}
      columns={columns}
      getRowId={(o) => o.id}
      searchText={(o) => `${o.id} ${o.title}`}
      searchPlaceholder="Search order number or item"
      filter={{
        label: "Statuses",
        options: (Object.keys(PAYMENT_STATUS_META) as PaymentStatus[]).map((s) => ({ value: s, label: PAYMENT_STATUS_META[s].label })),
        predicate: (o, v) => o.status === v,
      }}
      rowActions={(o) =>
        o.status === "held" || o.status === "handed-over" || o.status === "disputed" ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="secondary" onClick={() => update(o.id, { status: "completed" }, `${o.id}: funds released to seller`)}>
              Release
            </Button>
            <Button size="sm" variant="ghost" className="text-danger" onClick={() => update(o.id, { status: "refunded" }, `${o.id}: refunded to buyer`)}>
              Refund
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted">No action</span>
        )
      }
    />
  );
}
