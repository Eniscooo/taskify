"use server";

import { updateTag } from "next/cache";

/**
 * Shows a seller's change on cached pages (home, search results, listing
 * page) straight away instead of after the cache expires.
 */
export async function refreshListings(id?: string) {
  updateTag("listings");
  if (id) updateTag(`listing:${id}`);
}
