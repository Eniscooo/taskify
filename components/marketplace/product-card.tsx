import { MapPin } from "lucide-react";
import Link from "next/link";
import { ListingPhoto } from "@/components/ui/listing-photo";
import { conditionLabel, formatDistance, formatNaira } from "@/lib/formatters";
import type { Listing, MyListing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SaveButton } from "./save-button";

export function ProductCard({
  listing,
  variant = "compact",
  href = `/marketplace/listing/${listing.id}`,
  badge,
  className,
}: {
  listing: Listing | MyListing;
  variant?: "compact" | "large";
  /** Defaults to the listing page. */
  href?: string;
  /** Status label for the seller's own listings, e.g. "Draft". */
  badge?: string;
  className?: string;
}) {
  const large = variant === "large";
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link
        href={href}
        className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
      >
        <div className={cn("relative overflow-hidden", large ? "aspect-[4/3]" : "aspect-square")}>
          <ListingPhoto
            url={listing.images?.[0]?.url}
            title={listing.title}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {badge && (
            <span className="absolute top-2 left-2 rounded-full bg-foreground/85 px-2 py-0.5 text-[11px] font-semibold text-white">
              {badge}
            </span>
          )}
          {listing.condition === "new" && (
            <span className="absolute bottom-2 left-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] font-semibold text-white">
              Brand new
            </span>
          )}
        </div>
        <div className={cn("space-y-0.5", large ? "p-4" : "p-3")}>
          <p className={cn("font-extrabold tracking-tight", large ? "text-xl" : "text-base")}>
            {formatNaira(listing.price)}
          </p>
          <h3 className={cn("line-clamp-1 text-foreground", large ? "text-base font-semibold" : "text-sm")}>
            {listing.title}
          </h3>
          {large && listing.condition && <p className="text-sm text-muted">{conditionLabel(listing.condition)}</p>}
          <p className="flex items-center gap-1 pt-0.5 text-xs text-muted">
            <MapPin aria-hidden className="h-3.5 w-3.5" />
            {listing.area || "No location yet"}
            {large && listing.distanceKm != null && <span>· {formatDistance(listing.distanceKm)}</span>}
          </p>
        </div>
      </Link>
      <SaveButton title={listing.title} className="absolute top-2 right-2" />
    </article>
  );
}

export function ProductGrid({ listings, className }: { listings: Listing[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4", className)}>
      {listings.map((l) => (
        <ProductCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
