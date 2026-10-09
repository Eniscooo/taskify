import { MessageCircle, Package } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { ReportButton } from "@/components/listings/report-button";
import { ProductGrid } from "@/components/marketplace/product-card";
import { SafetyTip } from "@/components/payments/safety-notice";
import { ProfileHeader, ProfileStats } from "@/components/profile/profile-header";
import { ReviewList } from "@/components/profile/review-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getConversationIdForUser, getListings, getProfile, getReviews, staticIds } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/constants";
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

  const [allListings, reviews, conversationId] = await Promise.all([
    getListings(),
    getReviews(user.id),
    getConversationIdForUser(user.id),
  ]);
  const listings = allListings.filter((l) => l.sellerId === user.id);
  const isMe = user.id === CURRENT_USER_ID;

  return (
    <div className="space-y-6">
      <PageHeader title={shortName(user.name)} backHref="/" />
      <ProfileHeader
        user={user}
        actions={
          isMe ? (
            <ButtonLink href="/profile/edit" variant="outline" className="flex-1">
              Edit profile
            </ButtonLink>
          ) : (
            <ButtonLink href={conversationId ? `/messages/${conversationId}` : "/messages"} className="flex-1">
              <MessageCircle aria-hidden className="h-4 w-4" />
              Message
            </ButtonLink>
          )
        }
      />
      <ProfileStats user={user} />
      {!isMe && <SafetyTip>Never send money directly to {shortName(user.name)}&apos;s personal account. Pay through Naija Market.</SafetyTip>}

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

      {!isMe && <ReportButton subject="this user" />}
    </div>
  );
}
