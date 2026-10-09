import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExperience } from "@/components/marketplace/search-experience";
import { GridSkeleton, Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-5 pt-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <GridSkeleton />
        </div>
      }
    >
      <SearchExperience />
    </Suspense>
  );
}
