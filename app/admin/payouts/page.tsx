import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PayoutsTable } from "@/components/admin/payouts-table";
import { getAdminPayouts, getUser } from "@/lib/api";

export const metadata: Metadata = { title: "Payouts" };

export default async function AdminPayoutsPage() {
  const payouts = await getAdminPayouts();
  const rows = await Promise.all(
    payouts.map(async (p) => ({ ...p, userName: (await getUser(p.userId))?.name ?? p.userId })),
  );
  return (
    <>
      <AdminPageHeader title="Payouts" description="Seller and provider payouts via Paystack Transfers." />
      <PayoutsTable payouts={rows} />
    </>
  );
}
