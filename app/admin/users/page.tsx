import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { UsersTable } from "@/components/admin/users-table";
import { getAdminUsers } from "@/lib/api";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return (
    <>
      <AdminPageHeader title="Users" description="Verify identities and suspend bad actors." />
      <UsersTable users={users} />
    </>
  );
}
