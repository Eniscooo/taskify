"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";
import { NAV_ITEMS, isActive, type BadgeKey } from "./nav-items";

export function DesktopNav({ counts }: { counts: Record<BadgeKey | "notifications", number> }) {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Logo />
        <form
          role="search"
          className="relative max-w-sm flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/marketplace/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
          }}
        >
          <label htmlFor="desktop-search" className="sr-only">
            Search products and services
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            id="desktop-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, services..."
            className="h-10 w-full rounded-full border border-border bg-background pr-4 pl-9 text-sm focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none"
          />
        </form>
        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const count = item.badge ? counts[item.badge] : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand",
                  active ? "bg-brand-soft text-brand-dark" : "text-muted hover:text-foreground",
                )}
              >
                {item.label}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-danger px-1.5 text-[11px] text-white">
                    {count}
                    <span className="sr-only"> new</span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Bell aria-hidden className="h-5 w-5" />
            <span className="sr-only">Notifications, {counts.notifications} unread</span>
            {counts.notifications > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-danger" />
            )}
          </Link>
          {isPending ? (
            <span aria-hidden className="h-9 w-9 animate-pulse rounded-full bg-border" />
          ) : session ? (
            <Link href="/profile" className="rounded-full focus-visible:outline-2 focus-visible:outline-brand">
              <Avatar name={session.user.name} size="sm" />
              <span className="sr-only">Your profile</span>
            </Link>
          ) : (
            <ButtonLink href="/auth/login" size="sm">
              Log in
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
