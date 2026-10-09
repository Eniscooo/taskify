import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getListing, getListings, getSimilarListings, type ListingFilters } from "@/lib/api";

/*
 * Cached listing reads for Server Components. Listings are public, so one
 * cached result is shared by every visitor and refreshed every few minutes.
 * Mutations can refresh them sooner with `updateTag("listings")`.
 */

export async function cachedListings(filters: ListingFilters) {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");
  return getListings(filters);
}

export async function cachedListing(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings", `listing:${id}`);
  return getListing(id);
}

export async function cachedSimilarListings(id: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");
  return getSimilarListings(id);
}
