import { Bookmark, Package, Pencil, Share2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ProductGrid } from "@/components/marketplace/product-card";
import { ProfileHeader, ProfileStats } from "@/components/profile/profile-header";
import { ProfileMenu } from "@/components/profile/profile-menu";
import { ReviewList } from "@/components/profile/review-card";
import { WalletCard } from "@/components/profile/wallet-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/card";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/states";
import { getOrders, getReviews, getSavedListings } from "@/lib/api";
import { cachedListings } from "@/lib/data/listings";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const user = await requireUser("/profile");
  const [listings, saved, reviews, selling] = await Promise.all([
    cachedListings({ seller: user.username }),
    getSavedListings(user.id),
    getReviews(user.id),
    getOrders("selling", user.id),
  ]);
  const held = selling
    .filter((o) => o.status === "held" || o.status === "handed-over")
    .reduce((sum, o) => sum + o.amount - o.fee, 0);
  const paidOut = selling.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.amount - o.fee, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        actions={
          <ButtonLink href={`/profile/${user.username}`} variant="ghost" size="icon">
            <Share2 aria-hidden className="h-5 w-5" />
            <span className="sr-only">View public profile</span>
          </ButtonLink>
        }
      />
      <ProfileHeader
        user={user}
        actions={
          <ButtonLink href="/profile/edit" variant="outline" className="flex-1">
            <Pencil aria-hidden className="h-4 w-4" />
            Edit profile
          </ButtonLink>
        }
      />
      <ProfileStats user={user} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ProfileMenu />
        <WalletCard held={held} paidOut={paidOut} bank="GTBank ••4821" />
      </div>

      <section id="listings" aria-labelledby="listings-title" className="scroll-mt-24">
        <SectionHeader
          id="listings-title"
          title="My Listings"
          action={
            <ButtonLink href="/sell" size="sm" variant="secondary">
              + New
            </ButtonLink>
          }
        />
        {listings.length ? (
          <ProductGrid listings={listings} />
        ) : (
          <EmptyState
            icon={Package}
            title="No listings yet."
            description="Turn things you don't use into cash. Listing is free."
            action={<ButtonLink href="/sell">Sell an item</ButtonLink>}
          />
        )}
      </section>

      <section id="saved" aria-labelledby="saved-title" className="scroll-mt-24">
        <SectionHeader id="saved-title" title="Saved Items" />
        {saved.length ? (
          <ProductGrid listings={saved} />
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No saved items yet."
            description="Save products you like and find them here later."
          />
        )}
      </section>

      <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24">
        <SectionHeader id="reviews-title" title="Reviews about you" subtitle={`${user.reviewCount} reviews · ★ ${user.rating}`} />
        <div className="rounded-2xl border border-border bg-surface px-4">
          <ReviewList reviews={reviews} />
        </div>
      </section>
    </div>
  );
}
