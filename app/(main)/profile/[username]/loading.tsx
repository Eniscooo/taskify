import { GridSkeleton, ProfileSkeleton } from "@/components/ui/skeleton";

export default function PublicProfileLoading() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <ProfileSkeleton />
      <GridSkeleton count={4} />
    </div>
  );
}
