import { MapPin } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { RatingSummary } from "@/components/ui/rating-stars";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { formatDistance, formatNaira } from "@/lib/formatters";
import type { Provider } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProviderCard({
  provider,
  variant = "row",
  className,
}: {
  provider: Provider;
  variant?: "row" | "tile";
  className?: string;
}) {
  const href = `/hire/provider/${provider.id}`;

  if (variant === "tile") {
    return (
      <Link
        href={href}
        className={cn(
          "flex w-56 shrink-0 flex-col rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <Avatar name={provider.name} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate font-bold">{provider.name}</h3>
            <VerificationBadge verified={provider.verified} />
          </div>
        </div>
        <p className="mt-3 font-semibold">{provider.title}</p>
        <RatingSummary rating={provider.rating} count={provider.jobs} noun="jobs" />
        <p className="mt-0.5 text-sm text-muted">{formatDistance(provider.distanceKm)}</p>
        <p className="mt-3 border-t border-border pt-3 text-sm">
          From <span className="text-base font-extrabold">{formatNaira(provider.startingPrice)}</span>
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex gap-4 rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand",
        className,
      )}
    >
      <Avatar name={provider.name} size="lg" />
      <div className="min-w-0 flex-1">
        <VerificationBadge verified={provider.verified} />
        <h3 className="text-base font-bold">{provider.name}</h3>
        <p className="text-sm font-medium">{provider.title}</p>
        <RatingSummary rating={provider.rating} count={provider.jobs} noun="jobs" />
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin aria-hidden className="h-3.5 w-3.5" />
          {formatDistance(provider.distanceKm)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted">From</p>
        <p className="text-lg font-extrabold">{formatNaira(provider.startingPrice)}</p>
      </div>
    </Link>
  );
}
