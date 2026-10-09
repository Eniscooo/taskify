import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star rating. For input, use RatingInput in components/forms. */
export function RatingStars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          width={size}
          height={size}
          className={n <= Math.round(value) ? "fill-accent text-accent" : "fill-border text-border"}
        />
      ))}
    </span>
  );
}

/** Compact "★ 4.9 · 87 jobs" line used on cards. */
export function RatingSummary({ rating, count, noun }: { rating: number; count: number; noun: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Star aria-hidden className="h-4 w-4 fill-accent text-accent" />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-muted">
        · {count} {noun}
      </span>
    </span>
  );
}
