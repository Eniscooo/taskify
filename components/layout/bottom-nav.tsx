"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActive, shouldHideBottomNav, type BadgeKey } from "./nav-items";

export function BottomNav({ counts }: { counts: Record<BadgeKey, number> }) {
  const pathname = usePathname();
  if (shouldHideBottomNav(pathname)) return null;

  return (
    <nav
      aria-label="Main"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const count = item.badge ? counts[item.badge] : 0;
          const Icon = item.icon;
          const isSell = item.href === "/sell";
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "relative flex items-center justify-center",
                    isSell && "h-8 w-8 rounded-full bg-brand text-white",
                  )}
                >
                  <Icon aria-hidden className={cn(isSell ? "h-5 w-5" : "h-6 w-6")} strokeWidth={active ? 2.4 : 1.9} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] rounded-full border-2 border-surface bg-danger px-1 text-center text-[10px] leading-[14px] text-white">
                      {count}
                    </span>
                  )}
                </span>
                {item.label}
                {count > 0 && <span className="sr-only">, {count} new</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
