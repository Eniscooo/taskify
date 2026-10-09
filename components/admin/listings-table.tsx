"use client";

import Link from "next/link";
import { Badge, type Tone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { categoryLabel, formatNaira, formatRelative } from "@/lib/formatters";
import type { Listing } from "@/lib/types";
import { DataTable, type Column } from "./data-table";
import { useModeration } from "./use-moderation";

const STATUS_TONE: Record<Listing["status"], Tone> = {
  active: "brand",
  draft: "neutral",
  sold: "info",
  flagged: "accent",
  removed: "danger",
};

const columns: Column<Listing>[] = [
  {
    key: "title",
    header: "Listing",
    sortValue: (l) => l.title,
    render: (l) => (
      <Link href={`/marketplace/listing/${l.id}`} className="flex items-center gap-3 hover:underline">
        <PlaceholderImage title={l.title} className="h-10 w-10 shrink-0 rounded-lg" />
        <span className="max-w-60 truncate font-semibold">{l.title}</span>
      </Link>
    ),
  },
  { key: "price", header: "Price", sortValue: (l) => l.price, render: (l) => <span className="font-semibold">{formatNaira(l.price)}</span> },
  { key: "category", header: "Category", sortValue: (l) => l.category, render: (l) => categoryLabel(l.category) },
  { key: "area", header: "Area", sortValue: (l) => l.area, render: (l) => l.area },
  { key: "views", header: "Views", sortValue: (l) => l.views, render: (l) => l.views },
  { key: "posted", header: "Posted", sortValue: (l) => l.postedAt, render: (l) => formatRelative(l.postedAt) },
  {
    key: "status",
    header: "Status",
    sortValue: (l) => l.status,
    render: (l) => (
      <Badge tone={STATUS_TONE[l.status]} dot className="capitalize">
        {l.status}
      </Badge>
    ),
  },
];

export function ListingsTable({ listings }: { listings: Listing[] }) {
  const { rows, update } = useModeration(listings);
  return (
    <DataTable
      label="Listings"
      rows={rows}
      columns={columns}
      getRowId={(l) => l.id}
      searchText={(l) => `${l.title} ${l.id} ${l.area}`}
      searchPlaceholder="Search title, ID or area"
      filter={{
        label: "Statuses",
        options: [
          ...(["active", "flagged", "removed", "draft"] as const).map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) })),
          ...LISTING_CATEGORIES.map((c) => ({ value: `cat:${c.id}`, label: `Category: ${c.label}` })),
        ],
        predicate: (l, v) => (v.startsWith("cat:") ? l.category === v.slice(4) : l.status === v),
      }}
      rowActions={(l) => (
        <div className="flex justify-end gap-2">
          {l.status !== "active" && l.status !== "draft" && (
            <Button size="sm" variant="secondary" onClick={() => update(l.id, { status: "active" }, "Listing approved")}>
              Approve
            </Button>
          )}
          {l.status === "active" && (
            <Button size="sm" variant="outline" onClick={() => update(l.id, { status: "flagged" }, "Listing flagged for review")}>
              Flag
            </Button>
          )}
          {l.status !== "removed" && (
            <Button size="sm" variant="ghost" className="text-danger" onClick={() => update(l.id, { status: "removed" }, "Listing removed")}>
              Remove
            </Button>
          )}
        </div>
      )}
    />
  );
}
