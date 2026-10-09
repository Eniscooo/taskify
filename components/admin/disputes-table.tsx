"use client";

import Link from "next/link";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNaira, formatRelative } from "@/lib/formatters";
import type { Dispute } from "@/lib/types";
import { DataTable, type Column } from "./data-table";
import { useModeration } from "./use-moderation";

const STATUS: Record<Dispute["status"], { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "danger" },
  "under-review": { label: "Under review", tone: "accent" },
  "resolved-buyer": { label: "Refunded buyer", tone: "neutral" },
  "resolved-seller": { label: "Paid seller", tone: "brand" },
};

const columns: Column<Dispute & { openedByName: string }>[] = [
  { key: "id", header: "Case", sortValue: (d) => d.id, render: (d) => <span className="font-mono font-semibold">{d.id}</span> },
  {
    key: "order",
    header: "Order",
    render: (d) => (
      <Link href={`/orders/${d.orderId}`} className="font-mono hover:underline">
        {d.orderId}
      </Link>
    ),
  },
  { key: "reason", header: "Reason", render: (d) => d.reason },
  { key: "by", header: "Opened by", render: (d) => d.openedByName },
  { key: "amount", header: "Held amount", sortValue: (d) => d.amount, render: (d) => <span className="font-semibold">{formatNaira(d.amount)}</span> },
  { key: "opened", header: "Opened", sortValue: (d) => d.createdAt, render: (d) => formatRelative(d.createdAt) },
  {
    key: "status",
    header: "Status",
    sortValue: (d) => d.status,
    render: (d) => (
      <Badge tone={STATUS[d.status].tone} dot>
        {STATUS[d.status].label}
      </Badge>
    ),
  },
];

export function DisputesTable({ disputes }: { disputes: (Dispute & { openedByName: string })[] }) {
  const { rows, update } = useModeration(disputes);
  return (
    <DataTable
      label="Disputes"
      rows={rows}
      columns={columns}
      getRowId={(d) => d.id}
      searchText={(d) => `${d.id} ${d.orderId} ${d.reason} ${d.openedByName}`}
      searchPlaceholder="Search case, order or reason"
      filter={{
        label: "Statuses",
        options: Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label })),
        predicate: (d, v) => d.status === v,
      }}
      rowActions={(d) =>
        d.status === "open" || d.status === "under-review" ? (
          <div className="flex justify-end gap-2">
            {d.status === "open" && (
              <Button size="sm" variant="outline" onClick={() => update(d.id, { status: "under-review" }, `${d.id} assigned to you`)}>
                Review
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => update(d.id, { status: "resolved-seller" }, `${d.id}: funds released to seller`)}>
              Pay seller
            </Button>
            <Button size="sm" variant="ghost" className="text-danger" onClick={() => update(d.id, { status: "resolved-buyer" }, `${d.id}: buyer refunded`)}>
              Refund buyer
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted">Closed</span>
        )
      }
    />
  );
}
