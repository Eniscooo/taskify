"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky mobile header with a back button. On desktop it becomes a plain
 * in-flow page title since the global DesktopNav is already sticky.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  /** Fallback when there's no history to go back to. */
  backHref?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 -mx-4 mb-4 flex min-h-14 items-center gap-2 border-b border-border bg-surface/95 px-2 backdrop-blur md:static md:mx-0 md:mb-6 md:border-0 md:bg-transparent md:px-0 md:backdrop-blur-none",
        className,
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          onClick={(e) => {
            if (window.history.length > 1) {
              e.preventDefault();
              router.back();
            }
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand md:-ml-2"
        >
          <ArrowLeft aria-hidden className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
      )}
      <div className={cn("min-w-0 flex-1", !backHref && "pl-2 md:pl-0")}>
        <h1 className="truncate text-lg font-bold tracking-tight md:text-2xl">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted md:text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}
