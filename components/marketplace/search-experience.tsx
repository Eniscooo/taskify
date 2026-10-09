"use client";

import { ArrowLeft, Clock, PackageSearch, Search, SlidersHorizontal, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProviderCard } from "@/components/hire/provider-card";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { GridSkeleton } from "@/components/ui/skeleton";
import { getListings, getProviders, getSearchSuggestions, type ListingFilters } from "@/lib/api";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { filtersFromParams, filtersToQuery } from "@/lib/search-params";
import type { Listing, Provider } from "@/lib/types";
import { ActiveFilters } from "./active-filters";
import { countActiveFilters } from "./filter-panel";
import { FilterSheet } from "./filter-sheet";
import { LISTING_CATEGORY_ICONS } from "./category-icons";
import { ProductGrid } from "./product-card";

export function SearchExperience() {
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<ListingFilters>(() => filtersFromParams(params));
  const [text, setText] = useState(filters.q ?? "");
  const [resultState, setResultState] = useState<{ key: string; listings: Listing[] | null; providers: Provider[] } | null>(null);
  const [suggestions, setSuggestions] = useState<{ recent: string[]; suggested: string[] }>({ recent: [], suggested: [] });
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasQuery = !!filters.q || countActiveFilters(filters) > 0;
  const queryKey = filtersToQuery(filters);
  // Results are tied to the query that produced them, so stale ones never show.
  const results = hasQuery && resultState?.key === queryKey ? resultState : null;

  useEffect(() => {
    getSearchSuggestions().then(setSuggestions);
    if (!filters.q) inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus only on mount
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${queryKey}`);
    if (!hasQuery) return;
    let cancelled = false;
    // A failed listings fetch is kept as null so it shows an error rather than "no results".
    Promise.all([getListings(filters).catch(() => null), getProviders({ q: filters.q })]).then(([listings, providers]) => {
      if (!cancelled) setResultState({ key: queryKey, listings, providers: filters.q ? providers : [] });
    });
    return () => {
      cancelled = true;
    };
  }, [filters, hasQuery, queryKey]);

  const runSearch = (q: string) => {
    setText(q);
    setFilters((f) => ({ ...f, q: q.trim() || undefined }));
    if (q.trim()) setSuggestions((s) => ({ ...s, recent: [q.trim(), ...s.recent.filter((r) => r !== q.trim())].slice(0, 5) }));
  };

  return (
    <div className="space-y-5">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(text);
          inputRef.current?.blur();
        }}
        className="sticky top-0 z-30 -mx-4 flex items-center gap-2 border-b border-border bg-surface px-2 py-2 md:static md:mx-0 md:rounded-2xl md:border md:px-3"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowLeft aria-hidden className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </button>
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">
            Search products and services
          </label>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            enterKeyHint="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search products, services..."
            className="h-11 w-full rounded-xl bg-background pr-10 pl-9 text-base focus:ring-2 focus:ring-brand/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {text && (
            <button
              type="button"
              onClick={() => {
                runSearch("");
                inputRef.current?.focus();
              }}
              className="absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-black/5"
            >
              <X aria-hidden className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand"
        >
          <SlidersHorizontal aria-hidden className="h-5 w-5" />
          <span className="sr-only">Filters</span>
          {countActiveFilters(filters) > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-brand" />
          )}
        </button>
      </form>

      <h1 className="sr-only">Search</h1>
      <ActiveFilters filters={filters} onChange={setFilters} />

      {!hasQuery ? (
        <SearchHome
          recent={suggestions.recent}
          suggested={suggestions.suggested}
          onPick={runSearch}
          onClearRecent={() => setSuggestions((s) => ({ ...s, recent: [] }))}
        />
      ) : !results ? (
        <GridSkeleton />
      ) : results.listings === null ? (
        <ErrorState title="Couldn't load listings" description="Check your connection and search again." />
      ) : results.listings.length + results.providers.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={`No results for “${filters.q ?? "your filters"}”`}
          description="Check the spelling, try a more general word, or remove some filters."
        />
      ) : (
        <div className="space-y-6">
          {results.providers.length > 0 && (
            <section aria-labelledby="provider-results">
              <SectionHeader id="provider-results" title="Service providers" />
              <div className="grid gap-3 md:grid-cols-2">
                {results.providers.slice(0, 4).map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </section>
          )}
          <section aria-labelledby="listing-results">
            <SectionHeader
              id="listing-results"
              title={`${results.listings.length} ${results.listings.length === 1 ? "listing" : "listings"}`}
            />
            <ProductGrid listings={results.listings} />
          </section>
        </div>
      )}

      <FilterSheet open={sheetOpen} onClose={() => setSheetOpen(false)} filters={filters} onApply={setFilters} showCategory />
    </div>
  );
}

function SearchHome({
  recent,
  suggested,
  onPick,
  onClearRecent,
}: {
  recent: string[];
  suggested: string[];
  onPick: (q: string) => void;
  onClearRecent: () => void;
}) {
  return (
    <div className="space-y-7">
      {recent.length > 0 && (
        <section aria-labelledby="recent-title">
          <SectionHeader
            id="recent-title"
            title="Recent searches"
            action={
              <button type="button" onClick={onClearRecent} className="text-sm font-semibold text-brand hover:underline">
                Clear
              </button>
            }
          />
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {recent.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => onPick(r)}
                  className="flex h-12 w-full items-center gap-3 px-4 text-left hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
                >
                  <Clock aria-hidden className="h-4 w-4 text-muted" />
                  {r}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="suggested-title">
        <SectionHeader id="suggested-title" title="Popular in Lagos" />
        <ul className="flex flex-wrap gap-2">
          {suggested.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onPick(s.replace(/ under.*| near me/i, ""))}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand"
              >
                <TrendingUp aria-hidden className="h-4 w-4 text-brand" />
                {s}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="browse-title">
        <SectionHeader id="browse-title" title="Browse categories" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LISTING_CATEGORIES.map((c) => {
            const Icon = LISTING_CATEGORY_ICONS[c.id];
            return (
              <li key={c.id}>
                <Link
                  href={`/marketplace/category/${c.id}`}
                  className="flex h-16 items-center gap-3 rounded-2xl border border-border bg-surface px-4 font-semibold hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <Icon aria-hidden className="h-5 w-5 text-brand" />
                  {c.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/hire"
              className="flex h-16 items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft px-4 font-semibold text-brand-dark focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Search aria-hidden className="h-5 w-5" />
              Hire help
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
