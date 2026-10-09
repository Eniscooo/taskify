import { Eye, MapPin, Package, Truck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingBackButton } from "@/components/layout/floating-back-button";
import { StickyActionSpacer } from "@/components/layout/sticky-action-bar";
import { ImageGallery } from "@/components/listings/image-gallery";
import { ListingActions } from "@/components/listings/listing-actions";
import { ReportButton } from "@/components/listings/report-button";
import { SellerCard } from "@/components/listings/seller-card";
import { ProductGrid } from "@/components/marketplace/product-card";
import { SaveButton } from "@/components/marketplace/save-button";
import { BuyerProtection, SafetyTip } from "@/components/payments/safety-notice";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/card";
import { getConversationIdForListing, getProfile, getUser, staticIds } from "@/lib/api";
import { cachedListing, cachedSimilarListings } from "@/lib/data/listings";
import { categoryLabel, conditionLabel, deliveryLabel, formatNaira, formatRelative } from "@/lib/formatters";

export function generateStaticParams() {
  return staticIds.listings();
}

export async function generateMetadata({ params }: PageProps<"/marketplace/listing/[id]">): Promise<Metadata> {
  const listing = await cachedListing((await params).id);
  return { title: listing ? `${listing.title} — ${formatNaira(listing.price)}` : "Listing not found" };
}

export default async function ListingPage({ params }: PageProps<"/marketplace/listing/[id]">) {
  const { id } = await params;
  const listing = await cachedListing(id);
  if (!listing) notFound();

  const [seller, similar, conversationId] = await Promise.all([
    // Ratings and review counts aren't in the API yet, so the seller card
    // still reads the mock profile with the same username.
    listing.seller ? getProfile(listing.seller.username) : getUser(listing.sellerId),
    cachedSimilarListings(id),
    getConversationIdForListing(id),
  ]);
  if (!seller) notFound();

  const deliveryOptions = [
    (listing.delivery === "pickup" || listing.delivery === "both") && {
      icon: Package,
      title: `Pickup in ${listing.area}`,
      body: "Meet the seller, check the item, then confirm in the app.",
    },
    (listing.delivery === "seller-delivers" || listing.delivery === "both") && {
      icon: Truck,
      title: "Seller delivers",
      body: "Delivery fee agreed in chat. Confirm once it reaches you.",
    },
  ].filter(Boolean) as { icon: typeof Package; title: string; body: string }[];

  return (
    <article className="md:pt-2">
      <div className="md:grid md:grid-cols-[1.15fr_1fr] md:gap-8">
        <div className="relative">
          <ImageGallery title={listing.title} count={listing.photoCount} images={listing.images} />
          <div className="absolute top-3 right-0 left-0 flex justify-between md:hidden">
            <FloatingBackButton fallbackHref="/marketplace" />
            <SaveButton title={listing.title} className="h-11 w-11 shadow-md" />
          </div>
        </div>

        <div className="space-y-5 pt-4 md:pt-0">
          <header className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-3xl font-extrabold tracking-tight">{formatNaira(listing.price)}</p>
              <SaveButton title={listing.title} className="hidden border border-border md:flex" />
            </div>
            <h1 className="text-xl font-bold">{listing.title}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{conditionLabel(listing.condition)}</Badge>
              <Badge>{categoryLabel(listing.category)}</Badge>
              {listing.negotiable && <Badge>Open to offers</Badge>}
              {listing.status === "sold" && <Badge tone="danger">Sold</Badge>}
            </div>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <MapPin aria-hidden className="h-4 w-4" />
              {listing.area}, Lagos · Posted {formatRelative(listing.postedAt)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Truck aria-hidden className="h-4 w-4" />
              {deliveryLabel(listing.delivery)}
            </p>
          </header>

          <BuyerProtection />

          <div className="hidden md:block">
            <ListingActions
              listing={listing}
              sellerName={seller.name.split(" ")[0]!}
              conversationHref={`/messages/${conversationId}`}
              sellerUsername={seller.username}
            />
          </div>

          <SellerCard seller={seller} />
        </div>
      </div>

      <div className="mt-6 space-y-6 md:max-w-[calc(53.5%-1rem)]">
        <section aria-labelledby="desc-title">
          <SectionHeader id="desc-title" title="Description" />
          <p className="leading-relaxed whitespace-pre-line text-foreground/90">{listing.description}</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <Eye aria-hidden className="h-3.5 w-3.5" />
            {listing.views} views
          </p>
        </section>

        <section aria-labelledby="delivery-title">
          <SectionHeader id="delivery-title" title="Delivery options" />
          <ul className="space-y-2">
            {deliveryOptions.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
                <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <SafetyTip>
          Keep payments on Naija Market. Never send money directly to a seller&apos;s personal account — you
          lose buyer protection.
        </SafetyTip>
        <ReportButton subject="this listing" />
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-title" className="mt-8">
          <SectionHeader id="similar-title" title="Similar listings" />
          <ProductGrid listings={similar} />
        </section>
      )}

      <div className="md:hidden">
        <StickyActionSpacer />
        <ListingActions
          listing={listing}
          sellerName={seller.name.split(" ")[0]!}
          conversationHref={`/messages/${conversationId}`}
          sellerUsername={seller.username}
        />
      </div>
    </article>
  );
}
