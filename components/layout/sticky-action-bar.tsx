import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Fixed CTA bar on mobile; sits inline on desktop. Pair with <StickyActionSpacer />. */
export function StickyActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:static md:z-auto md:border-0 md:bg-transparent md:pb-0 md:backdrop-blur-none",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl gap-3 px-4 py-3 md:px-0">{children}</div>
    </div>
  );
}

export function StickyActionSpacer() {
  return <div aria-hidden className="h-24 md:hidden" />;
}
