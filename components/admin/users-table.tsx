"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import type { User } from "@/lib/types";
import { DataTable, type Column } from "./data-table";
import { useModeration } from "./use-moderation";

type AdminUser = User & { suspended?: boolean };

const columns: Column<AdminUser>[] = [
  {
    key: "name",
    header: "User",
    sortValue: (u) => u.name,
    render: (u) => (
      <div className="flex items-center gap-3">
        <Avatar name={u.name} size="sm" />
        <div>
          <p className="font-semibold">{u.name}</p>
          <p className="text-xs text-muted">@{u.username}</p>
        </div>
      </div>
    ),
  },
  { key: "phone", header: "Phone", render: (u) => <span className="whitespace-nowrap">{u.phone}</span> },
  { key: "area", header: "Area", sortValue: (u) => u.area, render: (u) => u.area },
  { key: "rating", header: "Rating", sortValue: (u) => u.rating, render: (u) => `★ ${u.rating.toFixed(1)}` },
  {
    key: "activity",
    header: "Sales / Jobs",
    sortValue: (u) => u.salesCount + u.jobsCount,
    render: (u) => `${u.salesCount} / ${u.jobsCount}`,
  },
  { key: "joined", header: "Joined", sortValue: (u) => u.joinedAt, render: (u) => formatDate(u.joinedAt) },
  {
    key: "status",
    header: "Status",
    render: (u) =>
      u.suspended ? (
        <Badge tone="danger" dot>Suspended</Badge>
      ) : u.verified ? (
        <Badge tone="brand" dot>ID verified</Badge>
      ) : (
        <Badge tone="accent" dot>Unverified</Badge>
      ),
  },
];

export function UsersTable({ users }: { users: User[] }) {
  const { rows, update } = useModeration<AdminUser>(users);
  return (
    <DataTable
      label="Users"
      rows={rows}
      columns={columns}
      getRowId={(u) => u.id}
      searchText={(u) => `${u.name} ${u.username} ${u.email} ${u.phone}`}
      searchPlaceholder="Search name, phone or email"
      filter={{
        label: "Statuses",
        options: [
          { value: "verified", label: "ID verified" },
          { value: "unverified", label: "Unverified" },
          { value: "suspended", label: "Suspended" },
        ],
        predicate: (u, v) => (v === "suspended" ? !!u.suspended : v === "verified" ? u.verified && !u.suspended : !u.verified),
      }}
      rowActions={(u) => (
        <div className="flex justify-end gap-2">
          {!u.verified && (
            <Button size="sm" variant="secondary" onClick={() => update(u.id, { verified: true }, `${u.name} marked as ID verified`)}>
              Verify
            </Button>
          )}
          <Button
            size="sm"
            variant={u.suspended ? "outline" : "ghost"}
            className={u.suspended ? "" : "text-danger"}
            onClick={() => update(u.id, { suspended: !u.suspended }, u.suspended ? `${u.name} reinstated` : `${u.name} suspended`)}
          >
            {u.suspended ? "Reinstate" : "Suspend"}
          </Button>
        </div>
      )}
    />
  );
}
