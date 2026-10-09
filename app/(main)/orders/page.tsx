import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { OrdersView } from "@/components/orders/orders-view";
import { BuyerProtection } from "@/components/payments/safety-notice";
import { OrderCardSkeleton } from "@/components/ui/skeleton";
import { getOrders, getUser } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/constants";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Orders" };

async function withCounterparty(orders: Order[]) {
  return Promise.all(
    orders.map(async (order) => ({
      order,
      counterparty: await getUser(order.buyerId === CURRENT_USER_ID ? order.sellerId : order.buyerId),
    })),
  );
}

export default async function OrdersPage() {
  const [buying, selling] = await Promise.all([
    getOrders("buying").then(withCounterparty),
    getOrders("selling").then(withCounterparty),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader title="Orders" subtitle="Track payments, hand-overs and payouts" />
      <BuyerProtection title="Every order is protected">
        Money is held by Naija Market and only released when the buyer confirms — or refunded if something goes
        wrong.
      </BuyerProtection>
      <Suspense
        fallback={
          <div className="space-y-3">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        }
      >
        <OrdersView buying={buying} selling={selling} />
      </Suspense>
    </div>
  );
}
