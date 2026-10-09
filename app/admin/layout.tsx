import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminStats } from "@/lib/api";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Naija Market Admin" },
  robots: { index: false },
};

/** Separate shell: the consumer bottom/top navigation never renders here. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getAdminStats();
  return (
    <div className="min-h-dvh lg:flex">
      <AdminNav badges={{ "/admin/disputes": stats.pendingDisputes, "/admin/payouts": stats.pendingPayouts }} />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
