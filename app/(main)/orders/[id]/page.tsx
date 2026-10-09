import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { OrderDetail } from "@/components/orders/order-detail";
import { getOrder, getUser, staticIds } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/constants";

export function generateStaticParams() {
  return staticIds.orders();
}

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  return { title: `Order ${(await params).id}` };
}

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const perspective = order.buyerId === CURRENT_USER_ID ? "buyer" : "seller";
  const counterparty = await getUser(perspective === "buyer" ? order.sellerId : order.buyerId);
  if (!counterparty) notFound();

  return (
    <>
      <PageHeader title={`Order ${order.id}`} subtitle={order.title} backHref="/orders" />
      <OrderDetail initialOrder={order} counterparty={counterparty} perspective={perspective} />
    </>
  );
}
