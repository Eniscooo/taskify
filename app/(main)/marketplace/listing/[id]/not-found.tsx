import { PackageX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export default function ListingNotFound() {
  return (
    <EmptyState
      icon={PackageX}
      title="This listing is no longer available"
      description="It may have been sold or removed by the seller."
      action={<ButtonLink href="/marketplace">Browse similar items</ButtonLink>}
    />
  );
}
