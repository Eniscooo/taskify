import { CalendarClock, Clock, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingBackButton } from "@/components/layout/floating-back-button";
import { StickyActionBar, StickyActionSpacer } from "@/components/layout/sticky-action-bar";
import { ReportButton } from "@/components/listings/report-button";
import { BuyerProtection } from "@/components/payments/safety-notice";
import { ReviewList } from "@/components/profile/review-card";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { RatingStars } from "@/components/ui/rating-stars";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { getConversationIdForUser, getProvider, getReviews, getUser, staticIds } from "@/lib/api";
import { formatDistance, formatNaira, serviceLabel } from "@/lib/formatters";

export function generateStaticParams() {
  return staticIds.providers();
}

export async function generateMetadata({ params }: PageProps<"/hire/provider/[id]">): Promise<Metadata> {
  const p = await getProvider((await params).id);
  return { title: p ? `${p.name} — ${p.title}` : "Provider" };
}

const PORTFOLIO_CAPTIONS: Record<string, string[]> = {
  plumbing: ["Bathroom pipes", "Water heater", "Kitchen sink", "Pumping machine", "Toilet cistern", "Overhead tank"],
  cleaning: ["Kitchen deep clean", "Living room", "Bathroom", "Post-construction"],
  default: ["Recent job", "Before & after", "Finished work", "Client site", "Detail work", "Team at work"],
};

export default async function ProviderPage({ params }: PageProps<"/hire/provider/[id]">) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) notFound();
  const [user, reviews, conversationId] = await Promise.all([
    getUser(provider.userId),
    getReviews(provider.userId),
    getConversationIdForUser(provider.userId),
  ]);
  const captions = PORTFOLIO_CAPTIONS[provider.service] ?? PORTFOLIO_CAPTIONS.default!;
  const requestHref = `/hire/task/new?service=${provider.service}`;

  const actions = (
    <>
      <ButtonLink href={conversationId ? `/messages/${conversationId}` : "/messages"} variant="outline" size="lg" className="flex-1">
        <MessageCircle aria-hidden className="h-5 w-5" />
        Message
      </ButtonLink>
      <ButtonLink href={requestHref} size="lg" className="flex-1">
        Request Service
      </ButtonLink>
    </>
  );

  return (
    <article>
      <div className="relative -mx-4 h-28 bg-gradient-to-br from-brand to-brand-dark md:mx-0 md:rounded-3xl">
        <FloatingBackButton fallbackHref="/hire" className="absolute top-3 left-3 md:hidden" />
      </div>

      <div className="md:grid md:grid-cols-[1fr_340px] md:gap-8">
        <div className="space-y-6">
          <header className="-mt-10 space-y-2">
            <Avatar name={provider.name} size="xl" className="rounded-full ring-4 ring-background" />
            <VerificationBadge verified={provider.verified} />
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.name ?? provider.name}</h1>
            <p className="font-semibold text-brand">{provider.title}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <RatingStars value={provider.rating} />
                <span className="font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                <span>({user?.reviewCount ?? reviews.length} reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden className="h-4 w-4" />
                {provider.area} · {formatDistance(provider.distanceKm)}
              </span>
            </div>
          </header>

          <dl className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-surface py-4 text-center">
            <div>
              <dt className="text-xs text-muted">Jobs done</dt>
              <dd className="text-xl font-extrabold">{provider.jobs}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Rating</dt>
              <dd className="text-xl font-extrabold">★ {provider.rating.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">From</dt>
              <dd className="text-xl font-extrabold">{formatNaira(provider.startingPrice)}</dd>
            </div>
          </dl>

          <section aria-labelledby="about-title">
            <SectionHeader id="about-title" title="About" />
            <p className="leading-relaxed text-foreground/90">{provider.about}</p>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
              <Clock aria-hidden className="h-4 w-4" />
              {provider.responseTime}
            </p>
          </section>

          <section aria-labelledby="services-title">
            <SectionHeader id="services-title" title="Services & pricing" subtitle="Final price agreed before you pay" />
            <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
              {provider.services.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="shrink-0 text-sm">
                    from <strong className="text-base">{formatNaira(s.price)}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="portfolio-title">
            <SectionHeader id="portfolio-title" title="Past work" subtitle={`${provider.portfolioCount} photos`} />
            <ul className="grid grid-cols-3 gap-2">
              {Array.from({ length: provider.portfolioCount }, (_, i) => (
                <li key={i}>
                  <figure>
                    <PlaceholderImage
                      title={`${serviceLabel(provider.service)} ${captions[i % captions.length]}`}
                      index={i}
                      className="aspect-square rounded-xl"
                    />
                    <figcaption className="mt-1 truncate text-xs text-muted">{captions[i % captions.length]}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="reviews-title">
            <SectionHeader id="reviews-title" title="Reviews" />
            <ReviewList reviews={reviews} />
          </section>
        </div>

        <aside className="mt-6 space-y-4 md:sticky md:top-24 md:mt-6 md:self-start">
          <Card className="p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold">
              <CalendarClock aria-hidden className="h-5 w-5 text-brand" />
              Availability
            </h2>
            <ul className="space-y-1 text-sm">
              {provider.availability.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Card>
          <BuyerProtection title="Pay safely">
            Your payment is held until you confirm the job is completed.
          </BuyerProtection>
          <div className="hidden gap-2 md:flex">{actions}</div>
          <ReportButton subject="this provider" />
        </aside>
      </div>

      <div className="md:hidden">
        <StickyActionSpacer />
        <StickyActionBar>{actions}</StickyActionBar>
      </div>
    </article>
  );
}
