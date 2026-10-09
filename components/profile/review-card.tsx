import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatDate } from "@/lib/formatters";
import type { Review } from "@/lib/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="py-4">
      <div className="flex items-center gap-3">
        <Avatar name={review.authorName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{review.authorName}</p>
          <p className="text-xs text-muted">
            {review.context} · {formatDate(review.createdAt, { month: "short", year: "numeric" })}
          </p>
        </div>
        <RatingStars value={review.rating} />
      </div>
      <p className="mt-2 text-sm leading-relaxed">{review.body}</p>
    </article>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return <p className="py-4 text-sm text-muted">No reviews yet.</p>;
  return (
    <div className="divide-y divide-border">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}
