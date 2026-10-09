"use client";

import { Receipt, Store } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { Tabs } from "@/components/ui/tabs";
import type { Order, User } from "@/lib/types";
import { OrderCard } from "./order-card";

type Role = "buying" | "selling";
export interface OrderRow {
  order: Order;
  counterparty: User | null;
}

export function OrdersView({ buying, selling }: { buying: OrderRow[]; selling: OrderRow[] }) {
  const params = useSearchParams();
  const [tab, setTab] = useState<Role>(params.get("tab") === "selling" ? "selling" : "buying");
  const rows = tab === "buying" ? buying : selling;
  const needsAction = (r: OrderRow[], status: Order["status"]) => r.filter((x) => x.order.status === status).length;

  return (
    <div className="space-y-4">
      <Tabs
        label="Order type"
        value={tab}
        onChange={(t) => {
          setTab(t);
          window.history.replaceState(null, "", t === "selling" ? "?tab=selling" : window.location.pathname);
        }}
        tabs={[
          { id: "buying", label: "Buying", count: needsAction(buying, "handed-over") },
          { id: "selling", label: "Selling", count: needsAction(selling, "held") },
        ]}
      />
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {rows.length === 0 ? (
          tab === "buying" ? (
            <EmptyState
              icon={Receipt}
              title="No orders yet."
              description="Your purchases will appear here."
              action={<ButtonLink href="/marketplace">Start shopping</ButtonLink>}
            />
          ) : (
            <EmptyState
              icon={Store}
              title="No sales yet."
              description="When someone buys your item, you'll track it here."
              action={<ButtonLink href="/sell">List an item</ButtonLink>}
            />
          )
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {rows.map(({ order, counterparty }) => (
              <li key={order.id}>
                <OrderCard order={order} counterparty={counterparty} role={tab} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
