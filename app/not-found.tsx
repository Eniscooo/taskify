import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <EmptyState
        icon={SearchX}
        title="We couldn't find that page"
        description="It may have been sold, removed or the link is wrong."
        action={<ButtonLink href="/">Back to Naija Market</ButtonLink>}
      />
    </main>
  );
}
