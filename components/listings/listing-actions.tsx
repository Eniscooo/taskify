"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StickyActionBar } from "@/components/layout/sticky-action-bar";
import { CheckoutSheet } from "@/components/payments/checkout-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { refreshListings } from "@/lib/actions/listings";
import { createOrder, updateListing } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatNaira } from "@/lib/formatters";
import type { Listing } from "@/lib/types";

export function ListingActions({
  listing,
  sellerName,
  sellerUsername,
  conversationHref,
}: {
  listing: Listing;
  sellerName: string;
  sellerUsername: string;
  conversationHref: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Checked in the browser so the listing page stays the same (and cached) for everyone.
  const { data: session } = authClient.useSession();
  const isOwner = session?.user.username === sellerUsername;

  const sold = listing.status === "sold";

  if (isOwner) {
    const toggleSold = async () => {
      setSaving(true);
      try {
        await updateListing(listing.id, { status: sold ? "active" : "sold" });
        await refreshListings(listing.id);
        toast(sold ? "Listed for sale again" : "Marked as sold");
        router.refresh();
      } catch {
        toast("Couldn't update the listing. Try again.", "error");
      } finally {
        setSaving(false);
      }
    };
    return (
      <StickyActionBar>
        <Button variant="outline" size="lg" className="flex-1" onClick={toggleSold} disabled={saving}>
          {saving && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          {sold ? "Relist" : "Mark as sold"}
        </Button>
        <ButtonLink href={`/sell?edit=${listing.id}`} size="lg" className="flex-1">
          Edit
        </ButtonLink>
      </StickyActionBar>
    );
  }

  if (sold) {
    return (
      <StickyActionBar>
        <p className="flex-1 text-center font-semibold text-muted">This item has been sold</p>
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
