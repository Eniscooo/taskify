"use client";

import {
  AlertTriangle,
  Banknote,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/payouts", label: "Payouts", icon: Banknote },
];

function NavLinks({ badges, onNavigate }: { badges: Record<string, number>; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon aria-hidden className="h-5 w-5" />
              <span className="flex-1">{label}</span>
              {badges[href] ? (
                <span className="rounded-full bg-accent px-2 text-xs leading-5 font-bold text-[#3d2800]">
                  {badges[href]}
                  <span className="sr-only"> pending</span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2 px-3 text-white">
      <LogoMark />
      <span className="font-extrabold">
        Naija Market <span className="font-medium text-white/60">Admin</span>
      </span>
    </Link>
  );
}

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 bg-foreground p-4 lg:flex">
        <Brand />
        <nav aria-label="Admin">
          <NavLinks badges={badges} />
        </nav>
        <Link href="/" className="mt-auto px-3 text-sm text-white/60 hover:text-white">
          ← Back to marketplace
        </Link>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-foreground px-3 lg:hidden">
        <Brand />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </header>
      {open && (
        <nav id="admin-mobile-nav" aria-label="Admin" className="fixed inset-x-0 top-14 z-30 animate-fade-in bg-foreground p-3 shadow-xl lg:hidden">
          <NavLinks badges={badges} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </>
  );
}
