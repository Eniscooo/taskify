"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import type { ConversationRow } from "@/lib/types";
import { ConversationCard } from "./conversation-card";

export function ConversationList({ rows }: { rows: ConversationRow[] }) {
  const pathname = usePathname();
  if (!rows.length) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No messages yet."
        description="Start a conversation with a seller or provider."
        action={<ButtonLink href="/marketplace">Browse listings</ButtonLink>}
      />
    );
  }
  return (
    <ul className="divide-y divide-border">
      {rows.map((row) => (
        <li key={row.conversation.id}>
          <ConversationCard {...row} active={pathname === `/messages/${row.conversation.id}`} />
        </li>
      ))}
    </ul>
  );
}
