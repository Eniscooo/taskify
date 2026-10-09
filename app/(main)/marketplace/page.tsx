import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryRail } from "@/components/marketplace/category-rail";
import { ListingBrowser } from "@/components/marketplace/listing-browser";
import { ModeSwitch } from "@/components/marketplace/mode-switch";
import { SearchBar } from "@/components/marketplace/search-bar";
import { BuyerProtection } from "@/components/payments/safety-notice";
import { GridSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <div className="space-y-5 pt-3 md:pt-0">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Marketplace</h1>
        <p className="text-sm text-muted">Phones, furniture, cars and more from people near you.</p>
      </div>
      <SearchBar />
      <ModeSwitch active="buy" />
      <CategoryRail />
      <BuyerProtection className="hidden md:flex" />
      <Suspense fallback={<GridSkeleton count={8} />}>
        <ListingBrowser />
      </Suspense>
    </div>
  );
}
