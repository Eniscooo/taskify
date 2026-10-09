import { OrderCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function OrderLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading order">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <OrderCardSkeleton />
    </div>
  );
}
