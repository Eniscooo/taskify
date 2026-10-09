import { Bell } from "lucide-react";
import Link from "next/link";
import { LocationSelector } from "@/components/marketplace/location-selector";
import type { Area } from "@/lib/types";
import { LogoMark } from "./logo";

/** Mobile-only top bar for the home screen. Desktop uses DesktopNav. */
export function HomeHeader({ area, unread }: { area: Area; unread: number }) {
  return (
    <header className="flex items-center justify-between gap-3 pt-3 md:hidden">
      <div className="flex items-center gap-2.5">
        <LogoMark />
        <div>
          <p className="text-base leading-tight font-extrabold tracking-tight">
            Naija <span className="text-brand">Market</span>
          </p>
          <LocationSelector value={area} className="-ml-0.5 h-6 text-xs" />
        </div>
      </div>
      <Link
        href="/notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Bell aria-hidden className="h-5 w-5" />
        <span className="sr-only">Notifications, {unread} unread</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] rounded-full border-2 border-background bg-danger px-1 text-center text-[10px] leading-[14px] font-bold text-white">
            {unread}
          </span>
        )}
      </Link>
    </header>
  );
}
