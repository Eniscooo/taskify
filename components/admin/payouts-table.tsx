"use client";

import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatNaira } from "@/lib/formatters";
import type { Payout } from "@/lib/types";
import { DataTable, type Column } from "./data-table";
import { useModeration } from "./use-moderation";

const STATUS: Record<Payout["status"], Tone> = {
  pending: "accent",
  processing: "info",
  paid: "brand",
  failed: "danger",
};

type Row = Payout & { userName: string };

const columns: Column<Row>[] = [
  { key: "id", header: "Payout", sortValue: (p) => p.id, render: (p) => <span className="font-mono font-semibold">{p.id}</span> },
  { key: "user", header: "Recipient", sortValue: (p) => p.userName, render: (p) => p.userName },
  { key: "bank", header: "Bank", render: (p) => `${p.bank} ••${p.accountLast4}` },
  { key: "amount", header: "Amount", sortValue: (p) => p.amount, render: (p) => <span className="font-semibold">{formatNaira(p.amount)}</span> },
  { key: "order", header: "Order", render: (p) => <span className="font-mono">{p.orderId}</span> },
  { key: "date", header: "Created", sortValue: (p) => p.createdAt, render: (p) => formatDateTime(p.createdAt) },
  {
    key: "status",
    header: "Status",
    sortValue: (p) => p.status,
    render: (p) => (
      <Badge tone={STATUS[p.status]} dot className="capitalize">
        {p.status}
      </Badge>
    ),
  },
];

export function PayoutsTable({ payouts }: { payouts: Row[] }) {
  const { rows, update } = useModeration(payouts);
  return (
    <DataTable
      label="Payouts"
      rows={rows}
      columns={columns}
      getRowId={(p) => p.id}
      searchText={(p) => `${p.id} ${p.userName} ${p.orderId} ${p.bank}`}
      searchPlaceholder="Search payout, recipient or order"
      filter={{
        label: "Statuses",
        options: (["pending", "processing", "paid", "failed"] as const).map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) })),
        predicate: (p, v) => p.status === v,
      }}
      rowActions={(p) =>
        p.status === "pending" ? (
          <Button size="sm" variant="secondary" onClick={() => update(p.id, { status: "processing" }, `${p.id} sent to Paystack`)}>
            Approve
          </Button>
        ) : p.status === "failed" ? (
          <Button size="sm" variant="outline" onClick={() => update(p.id, { status: "processing" }, `${p.id} retried`)}>
            Retry
          </Button>
        ) : (
          <span className="text-xs text-muted">—</span>
        )
      }
    />
  );
}
