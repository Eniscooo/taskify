import { ProfileSkeleton, ProviderCardSkeleton } from "@/components/ui/skeleton";

export default function ProviderLoading() {
  return (
    <div aria-busy="true" aria-label="Loading provider">
      <ProfileSkeleton />
      <ProviderCardSkeleton />
    </div>
  );
}
