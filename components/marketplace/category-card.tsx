import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Square icon tile used in category rails and grids. */
export function CategoryCard({
  href,
  label,
  icon: Icon,
  active,
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-xl py-1 text-center focus-visible:outline-2 focus-visible:outline-brand",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors",
          active
            ? "border-brand bg-brand text-white"
            : "border-border bg-surface text-brand group-hover:border-brand/40",
        )}
      >
        <Icon aria-hidden className="h-6 w-6" strokeWidth={1.8} />
      </span>
      <span className={cn("text-xs font-semibold", active ? "text-brand" : "text-foreground")}>{label}</span>
    </Link>
  );
}
