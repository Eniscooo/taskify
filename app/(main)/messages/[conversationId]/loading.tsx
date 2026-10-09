import { ListRowSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading conversation">
      <ListRowSkeleton />
      <Skeleton className="ml-auto h-10 w-2/3 rounded-2xl" />
      <Skeleton className="h-10 w-1/2 rounded-2xl" />
      <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
    </div>
  );
}
