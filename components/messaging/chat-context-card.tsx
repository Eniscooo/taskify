import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { formatNaira } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/** Compact product / task card pinned to the top of a chat. */
export function ChatContextCard({
  href,
  title,
  price,
  meta,
  action,
  className,
}: {
  href: string;
  title: string;
  price: number;
  meta: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5", className)}>
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-brand">
        <PlaceholderImage title={title} className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-sm">
            <span className="font-extrabold">{formatNaira(price)}</span>
            <span className="text-muted"> · {meta}</span>
          </p>
        </div>
      </Link>
      {action}
    </div>
  );
}
