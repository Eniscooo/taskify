import { AlertTriangle, Banknote, ChevronRight, Package, Receipt, TrendingUp, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatus } from "@/components/payments/order-status";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminDisputes, getAdminListings, getAdminOrders, getAdminPayouts, getAdminStats } from "@/lib/api";
import { formatCompactNaira, formatNaira, formatNumber, formatRelative } from "@/lib/formatters";

export const metadata: Metadata = { title: "Dashboard" };

function Panel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-bold">{title}</h2>
        <Link href={href} className="inline-flex items-center text-sm font-semibold text-brand hover:underline">
          View all <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <ul className="divide-y divide-border">{children}</ul>
    </Card>
  );
}

export default async function AdminDashboard() {
  const [stats, disputes, payouts, listings, orders] = await Promise.all([
    getAdminStats(),
    getAdminDisputes(),
    getAdminPayouts(),
    getAdminListings(),
    getAdminOrders(),
  ]);
  const openDisputes = disputes.filter((d) => d.status === "open" || d.status === "under-review");
  const pendingPayouts = payouts.filter((p) => p.status === "pending" || p.status === "failed");
  const flagged = listings.filter((l) => l.status === "flagged");
  const heldFunds = orders
    .filter((o) => ["held", "handed-over", "disputed"].includes(o.status))
    .reduce((s, o) => s + o.amount, 0);

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Wednesday, 7 October 2026 · Lagos" />

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total users" value={formatNumber(stats.totalUsers)} icon={Users} href="/admin/users" note="+312 this week" />
        <StatCard label="Active listings" value={formatNumber(stats.activeListings)} icon={Package} href="/admin/listings" />
        <StatCard label="Orders" value={formatNumber(stats.orders)} icon={Receipt} href="/admin/orders" note="This month" />
        <StatCard label="GMV" value={formatCompactNaira(stats.gmv)} icon={TrendingUp} href="/admin/orders" note="This month" />
        <StatCard label="Pending disputes" value={String(stats.pendingDisputes)} icon={AlertTriangle} href="/admin/disputes" highlight={stats.pendingDisputes > 0} />
        <StatCard label="Pending payouts" value={String(stats.pendingPayouts)} icon={Banknote} href="/admin/payouts" highlight={stats.pendingPayouts > 0} />
      </section>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-2 p-4">
        <p className="text-sm text-muted">Funds currently held in escrow</p>
        <p className="text-xl font-extrabold">{formatNaira(heldFunds)}</p>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Disputes needing action" href="/admin/disputes">
          {openDisputes.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">{d.reason}</p>
                <p className="text-xs text-muted">
                  {d.id} · {d.orderId} · {formatRelative(d.createdAt)}
                </p>
              </div>
              <span className="font-semibold">{formatNaira(d.amount)}</span>
            </li>
          ))}
        </Panel>
        <Panel title="Payouts to approve" href="/admin/payouts">
          {pendingPayouts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold">{p.bank} ••{p.accountLast4}</p>
                <p className="text-xs text-muted">
                  {p.id} · {formatRelative(p.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatNaira(p.amount)}</p>
                {p.status === "failed" && <Badge tone="danger">Failed</Badge>}
              </div>
            </li>
          ))}
        </Panel>
        <Panel title="Flagged listings" href="/admin/listings">
          {flagged.length ? (
            flagged.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <p className="truncate font-semibold">{l.title}</p>
                <span className="shrink-0">{formatNaira(l.price)}</span>
              </li>
            ))
          ) : (
            <li className="px-4 py-6 text-center text-sm text-muted">Nothing flagged 🎉</li>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Recent orders" href="/admin/orders">
          {orders.slice(0, 5).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-semibold">{o.title}</p>
                <p className="font-mono text-xs text-muted">{o.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatus status={o.status} />
                <span className="w-24 text-right font-semibold">{formatNaira(o.amount)}</span>
              </div>
            </li>
          ))}
        </Panel>
      </div>
    </>
  );
}
