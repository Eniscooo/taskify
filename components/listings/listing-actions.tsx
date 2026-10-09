"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { CheckoutSheet } from "@/components/payments/checkout-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { createOrder } from "@/lib/api";
import { formatNaira } from "@/lib/formatters";
import type { Listing } from "@/lib/types";

export function ListingActions({
  listing,
  sellerName,
  conversationHref,
  isOwner,
}: {
  listing: Listing;
  sellerName: string;
  conversationHref: string;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (isOwner) {
    return (
      <StickyActionBar>
        <ButtonLink href="/profile" variant="outline" size="lg" className="flex-1">
          Manage listing
        </ButtonLink>
        <ButtonLink href="/sell" size="lg" className="flex-1">
          Edit
        </ButtonLink>
      </StickyActionBar>
    );
  }

  return (
    <>
      <StickyActionBar>
        <ButtonLink href={conversationHref} variant="outline" size="lg" className="flex-1">
          <MessageCircle aria-hidden className="h-5 w-5" />
          Message Seller
        </ButtonLink>
        <Button size="lg" className="flex-1" onClick={() => setOpen(true)}>
          Buy Now
          <span className="sr-only"> for {formatNaira(listing.price)}</span>
        </Button>
      </StickyActionBar>
      <CheckoutSheet
        open={open}
        onClose={() => setOpen(false)}
        title={listing.title}
        counterparty={sellerName}
        amount={listing.price}
        orderHref="/orders/NM-20431"
        onPay={() => createOrder(listing.id)}
      />
    </>
  );
}
