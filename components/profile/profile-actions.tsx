"use client";

import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/*
 * Public profiles are the same (and cached) for every visitor, so whether
 * it's the viewer's own profile is decided in the browser.
 */

function useIsOwnProfile(username: string) {
  const { data: session } = authClient.useSession();
  return session?.user.username === username;
}

export function ProfileActions({ username, messageHref }: { username: string; messageHref: string }) {
  if (useIsOwnProfile(username)) {
    return (
      <ButtonLink href="/profile/edit" variant="outline" className="flex-1">
        Edit profile
      </ButtonLink>
    );
  }
  return (
    <ButtonLink href={messageHref} className="flex-1">
      <MessageCircle aria-hidden className="h-4 w-4" />
      Message
    </ButtonLink>
  );
}

/** Renders its children unless the viewer is looking at their own profile. */
export function HideOnOwnProfile({ username, children }: { username: string; children: ReactNode }) {
  return useIsOwnProfile(username) ? null : children;
}
