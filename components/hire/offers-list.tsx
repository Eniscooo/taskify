"use client";

import { Inbox } from "lucide-react";
import { useState } from "react";
import { CheckoutSheet } from "@/components/payments/checkout-sheet";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/states";
import { acceptOffer } from "@/lib/api";
import type { Offer, Provider } from "@/lib/types";
import { OfferCard } from "./offer-card";

type Sort = "recommended" | "price" | "rating";

export function OffersList({
  offers,
  providers,
  budget,
  taskTitle,
  closed,
  conversationHrefs,
}: {
  conversationHrefs: Record<string, string>;
  offers: Offer[];
  providers: Record<string, Provider>;
  budget: number;
  taskTitle: string;
  closed: boolean;
}) {
  const [sort, setSort] = useState<Sort>("recommended");
  const [pending, setPending] = useState<Offer | null>(null);
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  const sorted = [...offers].sort((a, b) => {
    const pa = providers[a.providerId]!;
    const pb = providers[b.providerId]!;
    if (sort === "price") return a.price - b.price;
    if (sort === "rating") return pb.rating - pa.rating;
    // Recommended: weigh rating and job count against price.
    return pb.rating * Math.log(pb.jobs + 1) - pb.distanceKm / 10 - (pa.rating * Math.log(pa.jobs + 1) - pa.distanceKm / 10);
  });

  if (!offers.length) {
    return (
      <EmptyState
        icon={Inbox}
        title={closed ? "This task is closed" : "No offers yet"}
        description={
          closed
            ? "Offers are no longer being accepted. See the order for payment details."
            : "We've notified providers nearby. Most tasks get their first offer within an hour."
        }
      />
    );
  }

  const pendingProvider = pending ? providers[pending.providerId] : undefined;

  return (
    <div className="space-y-3">
      <div className="flex gap-2" role="group" aria-label="Sort offers">
        {(
          [
            ["recommended", "Recommended"],
            ["price", "Lowest price"],
            ["rating", "Top rated"],
          ] as const
        ).map(([id, label]) => (
          <Chip key={id} active={sort === id} className="h-9 px-3 text-xs" onClick={() => setSort(id)}>
            {label}
          </Chip>
        ))}
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {sorted.map((offer) => (
          <li key={offer.id}>
            <OfferCard
              offer={offer}
              provider={providers[offer.providerId]!}
              budget={budget}
              accepted={acceptedId === offer.id}
              disabled={closed || (!!acceptedId && acceptedId !== offer.id)}
              onAccept={() => setPending(offer)}
              conversationHref={conversationHrefs[offer.providerId]}
            />
          </li>
        ))}
      </ul>
      {pending && pendingProvider && (
        <CheckoutSheet
          open={!!pending}
          onClose={() => setPending(null)}
          kind="service"
          title={`${taskTitle} · ${pendingProvider.name}`}
          counterparty={pendingProvider.name}
          amount={pending.price}
          orderHref="/orders/NM-20377"
          onPay={async () => {
            await acceptOffer(pending.id);
            setAcceptedId(pending.id);
          }}
        />
      )}
    </div>
  );
}
