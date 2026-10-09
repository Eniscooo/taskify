"use client";

import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { RatingSummary } from "@/components/ui/rating-stars";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { formatDistance, formatNaira, formatRelative } from "@/lib/formatters";
import type { Offer, Provider } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OfferCard({
  offer,
  provider,
  budget,
  accepted,
  disabled,
  onAccept,
  conversationHref = "/messages",
}: {
  conversationHref?: string;
  offer: Offer;
  provider: Provider;
  budget: number;
  accepted?: boolean;
  disabled?: boolean;
  onAccept: () => void;
}) {
  const diff = offer.price - budget;
  return (
    <article
      className={cn(
        "rounded-2xl border bg-surface p-4 transition-colors",
        accepted ? "border-brand ring-2 ring-brand/20" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        <Link href={`/hire/provider/${provider.id}`} className="rounded-full focus-visible:outline-2 focus-visible:outline-brand">
          <Avatar name={provider.name} size="lg" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/hire/provider/${provider.id}`} className="font-bold hover:underline">
            {provider.name}
          </Link>
          <div>
            <VerificationBadge verified={provider.verified} />
          </div>
          <RatingSummary rating={provider.rating} count={provider.jobs} noun="jobs" />
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin aria-hidden className="h-3.5 w-3.5" />
            {formatDistance(provider.distanceKm)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-extrabold">{formatNaira(offer.price)}</p>
          <p className={cn("text-xs font-semibold", diff <= 0 ? "text-brand" : "text-[#8a5800]")}>
            {diff === 0 ? "Matches budget" : diff < 0 ? `${formatNaira(-diff)} under budget` : `${formatNaira(diff)} over budget`}
          </p>
        </div>
      </div>
      <blockquote className="mt-3 rounded-xl bg-background p-3 text-sm leading-relaxed">“{offer.message}”</blockquote>
      <p className="mt-2 text-xs text-muted">Sent {formatRelative(offer.createdAt)}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ButtonLink href={conversationHref} variant="outline">
          <MessageCircle aria-hidden className="h-4 w-4" />
          Message
        </ButtonLink>
        <Button onClick={onAccept} disabled={disabled || accepted}>
          {accepted ? "Accepted" : "Accept & Pay"}
        </Button>
      </div>
    </article>
  );
}
