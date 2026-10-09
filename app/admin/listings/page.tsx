import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ListingsTable } from "@/components/admin/listings-table";
import { getAdminListings } from "@/lib/api";

export const metadata: Metadata = { title: "Listings" };

export default async function AdminListingsPage() {
  const listings = await getAdminListings();
  return (
    <>
      <AdminPageHeader title="Listings" description="Review flagged items and remove prohibited listings." />
      <ListingsTable listings={listings} />
    </>
  );
}
