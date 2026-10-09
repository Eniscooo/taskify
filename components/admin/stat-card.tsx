import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  note,
  highlight,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  href: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-2xl border p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand",
        highlight ? "border-accent/40 bg-accent-soft" : "border-border bg-surface",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <Icon aria-hidden className={cn("h-5 w-5", highlight ? "text-[#8a5800]" : "text-brand")} />
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight">{value}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </Link>
  );
}
