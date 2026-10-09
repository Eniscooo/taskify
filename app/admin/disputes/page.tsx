import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DisputesTable } from "@/components/admin/disputes-table";
import { getAdminDisputes, getUser } from "@/lib/api";

export const metadata: Metadata = { title: "Disputes" };

export default async function AdminDisputesPage() {
  const disputes = await getAdminDisputes();
  const rows = await Promise.all(
    disputes.map(async (d) => ({ ...d, openedByName: (await getUser(d.openedBy))?.name ?? d.openedBy })),
  );
  return (
    <>
      <AdminPageHeader title="Disputes" description="Funds stay held until a dispute is resolved." />
      <DisputesTable disputes={rows} />
    </>
  );
}
