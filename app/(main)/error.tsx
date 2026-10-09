"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";

export default function MainError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Report to monitoring; never show raw errors to users.
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      description="We couldn't load this page. Check your connection and try again."
      action={
        <div className="flex gap-2">
          <ButtonLink href="/" variant="outline">
            Go home
          </ButtonLink>
          <Button onClick={() => retry()}>Try again</Button>
        </div>
      }
    />
  );
}
