"use client";

import { PackageSearch, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { GridSkeleton } from "@/components/ui/skeleton";
import { getListings, type ListingFilters } from "@/lib/api";
import { filtersFromParams, filtersToQuery } from "@/lib/search-params";
import type { Listing, ListingCategory } from "@/lib/types";
import { ActiveFilters } from "./active-filters";
import { FilterPanel, countActiveFilters } from "./filter-panel";
import { FilterSheet } from "./filter-sheet";
import { ProductGrid } from "./product-card";

/**
 * Filterable listing grid. Filters live in the URL so results are
 * shareable and survive refresh. Desktop shows a sticky sidebar; mobile
 * opens a full-screen filter sheet.
 */
export function ListingBrowser({ lockedCategory }: { lockedCategory?: ListingCategory }) {
  const params = useSearchParams();
  const [filters, setFilters] = useState<ListingFilters>(() => ({
    ...filtersFromParams(params),
    ...(lockedCategory && { category: lockedCategory }),
  }));
  const [results, setResults] = useState<Listing[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getListings(filters).then((r) => !cancelled && setResults(r));
    window.history.replaceState(null, "", `${window.location.pathname}${filtersToQuery(filters, lockedCategory ? ["category"] : [])}`);
    return () => {
      cancelled = true;
    };
  }, [filters, lockedCategory]);

  const activeCount = countActiveFilters(filters, !!lockedCategory);

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-base font-bold">Filters</h2>
          <FilterPanel filters={filters} onChange={setFilters} showCategory={!lockedCategory} />
        </div>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {results ? `${results.length} ${results.length === 1 ? "listing" : "listings"}` : "Loading listings…"}
          </p>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal aria-hidden className="h-4 w-4" />
            Filters{activeCount > 0 && ` (${activeCount})`}
          </Button>
        </div>
        <ActiveFilters filters={filters} onChange={setFilters} hideCategory={!!lockedCategory} />

        {!results ? (
          <GridSkeleton />
        ) : results.length ? (
          <ProductGrid listings={results} className="lg:grid-cols-3" />
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="No listings match"
            description="Try a wider price range, another area, or fewer filters."
            action={
              <Button variant="secondary" onClick={() => setFilters({ q: filters.q, category: lockedCategory })}>
                Clear filters
              </Button>
            }
          />
        )}
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onApply={setFilters}
        showCategory={!lockedCategory}
      />
    </div>
  );
}
