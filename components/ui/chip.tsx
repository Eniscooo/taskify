import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const chipBase =
  "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const chipState = (active?: boolean) =>
  active
    ? "border-foreground bg-foreground text-white"
    : "border-border bg-surface text-foreground hover:border-foreground/30";

export function Chip({
  active,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(chipBase, chipState(active), className)}
      {...props}
    />
  );
}

export function ChipLink({
  active,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { active?: boolean; children: ReactNode }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(chipBase, chipState(active), className)}
      {...props}
    >
      {children}
    </Link>
  );
}

/** Horizontally scrolling rail that bleeds to the screen edge on mobile. */
export function ChipRail({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0", className)}
    >
      {children}
    </div>
  );
}
