import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getAdminOrders } from "@/lib/api";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return (
    <>
      <AdminPageHeader title="Orders" description="Every order's escrow state. Release or refund held funds manually." />
      <OrdersTable orders={orders} />
    </>
  );
}
