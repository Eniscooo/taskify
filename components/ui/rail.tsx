import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Horizontal scroll-snap list that bleeds to the screen edge on mobile. */
export function Rail({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function RailItem({ children, className }: { children: ReactNode; className?: string }) {
  return <li className={cn("shrink-0 snap-start", className)}>{children}</li>;
}
