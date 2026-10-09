import { ProviderCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function TaskLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading task">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />
    </div>
  );
}
