"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { getMyListing } from "@/lib/api";
import type { MyListing } from "@/lib/types";
import { SellForm } from "./sell-form";

/** A blank form, or with ?edit=<id>, the seller's listing loaded for editing. */
export function SellPageContent() {
  const editId = useSearchParams().get("edit");
  const [loaded, setLoaded] = useState<{ id: string; listing: MyListing | null }>();

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    getMyListing(editId).then(
      (listing) => !cancelled && setLoaded({ id: editId, listing }),
      () => !cancelled && setLoaded({ id: editId, listing: null }),
    );
    return () => {
      cancelled = true;
    };
  }, [editId]);

  if (!editId) return <SellForm />;
  if (loaded?.id !== editId) return <ProfileSkeleton />;
  if (!loaded.listing) {
    return (
      <ErrorState
        title="Listing not found"
        description="It may have been removed, or it isn't one of yours."
        action={<ButtonLink href="/sell">Sell something new</ButtonLink>}
      />
    );
  }
  // key: a fresh form per listing, so switching between edits resets state.
  return <SellForm key={loaded.listing.id} listing={loaded.listing} />;
}
