import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Tappable search field that opens the full-screen search route.
 * Mobile search should always take over the screen, so this is a link,
 * not an input.
 */
export function SearchBar({
  placeholder = "Search products, services...",
  href = "/marketplace/search",
  className,
}: {
  placeholder?: string;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-13 items-center gap-3 rounded-2xl border border-border bg-surface px-4 text-muted shadow-sm transition-colors hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand",
        className,
      )}
    >
      <Search aria-hidden className="h-5 w-5 text-foreground" />
      <span className="flex-1 text-[15px]">{placeholder}</span>
      <SlidersHorizontal aria-hidden className="h-5 w-5" />
      <span className="sr-only">Open search and filters</span>
    </Link>
  );
}
