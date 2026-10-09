import { Package } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ReportButton } from "@/components/listings/report-button";
import { ProductGrid } from "@/components/marketplace/product-card";
import { SafetyTip } from "@/components/payments/safety-notice";
import { HideOnOwnProfile, ProfileActions } from "@/components/profile/profile-actions";
import { ProfileHeader, ProfileStats } from "@/components/profile/profile-header";
import { ReviewList } from "@/components/profile/review-card";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getConversationIdForUser, getProfile, getReviews, staticIds } from "@/lib/api";
import { cachedListings } from "@/lib/data/listings";
import { shortName } from "@/lib/formatters";

export function generateStaticParams() {
  return staticIds.usernames();
}

export async function generateMetadata({ params }: PageProps<"/profile/[username]">): Promise<Metadata> {
  const user = await getProfile((await params).username);
  return { title: user ? shortName(user.name) : "Profile" };
}

export default async function PublicProfilePage({ params }: PageProps<"/profile/[username]">) {
  const { username } = await params;
  const user = await getProfile(username);
  if (!user) notFound();

  const [listings, reviews, conversationId] = await Promise.all([
    cachedListings({ seller: username }),
    getReviews(user.id),
    getConversationIdForUser(user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={shortName(user.name)} backHref="/" />
      <ProfileHeader
        user={user}
        actions={
          <ProfileActions
            username={user.username}
            messageHref={conversationId ? `/messages/${conversationId}` : "/messages"}
          />
        }
      />
      <ProfileStats user={user} />
      <HideOnOwnProfile username={user.username}>
        <SafetyTip>Never send money directly to {shortName(user.name)}&apos;s personal account. Pay through Naija Market.</SafetyTip>
      </HideOnOwnProfile>

      <section aria-labelledby="pub-listings">
        <SectionHeader id="pub-listings" title={`Listings (${listings.length})`} />
        {listings.length ? (
          <ProductGrid listings={listings} />
        ) : (
          <EmptyState icon={Package} title="No active listings" description={`${shortName(user.name)} isn't selling anything right now.`} />
        )}
      </section>

      <section aria-labelledby="pub-reviews">
        <SectionHeader id="pub-reviews" title="Reviews" />
        <div className="rounded-2xl border border-border bg-surface px-4">
          <ReviewList reviews={reviews} />
        </div>
      </section>

      <HideOnOwnProfile username={user.username}>
        <ReportButton subject="this user" />
      </HideOnOwnProfile>
    </div>
  );
}
