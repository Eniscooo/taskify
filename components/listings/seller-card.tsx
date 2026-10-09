import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { formatDate, shortName } from "@/lib/formatters";
import type { User } from "@/lib/types";

export function SellerCard({ seller, role = "Seller" }: { seller: User; role?: string }) {
  return (
    <Link
      href={`/profile/${seller.username}`}
      className="block rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand"
    >
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">{role}</p>
      <div className="flex items-center gap-3">
        <Avatar name={seller.name} size="lg" online />
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">{shortName(seller.name)}</p>
          <VerificationBadge verified={seller.verified} label="Verified" />
        </div>
        <ChevronRight aria-hidden className="h-5 w-5 text-muted" />
      </div>
      <dl className="mt-4 grid grid-cols-3 divide-x divide-border rounded-xl bg-background py-3 text-center">
        <div>
          <dt className="sr-only">Rating</dt>
          <dd className="flex flex-col items-center">
            <span className="font-extrabold">★ {seller.rating.toFixed(1)}</span>
            <RatingStars value={seller.rating} size={10} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Reviews</dt>
          <dd className="font-extrabold">{seller.reviewCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{seller.jobsCount > seller.salesCount ? "Jobs" : "Sales"}</dt>
          <dd className="font-extrabold">{Math.max(seller.salesCount, seller.jobsCount)}</dd>
        </div>
      </dl>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
        <Clock aria-hidden className="h-4 w-4" />
        {seller.responseTime}
      </p>
      <p className="mt-1 text-xs text-muted">On Naija Market since {formatDate(seller.joinedAt, { month: "long", year: "numeric" })}</p>
    </Link>
  );
}
