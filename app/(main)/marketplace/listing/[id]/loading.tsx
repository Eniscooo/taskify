import { Skeleton } from "@/components/ui/skeleton";

export default function ListingLoading() {
  return (
    <div className="md:grid md:grid-cols-[1.15fr_1fr] md:gap-8" aria-busy="true" aria-label="Loading listing">
      <Skeleton className="-mx-4 aspect-square rounded-none md:mx-0 md:aspect-[4/3] md:rounded-3xl" />
      <div className="space-y-3 pt-4 md:pt-0">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
