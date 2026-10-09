import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { formatConversationTime, shortName } from "@/lib/formatters";
import type { Conversation, User } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ConversationCard({
  conversation,
  participant,
  subject,
  active,
}: {
  conversation: Conversation;
  participant: User;
  subject: string;
  active?: boolean;
}) {
  const unread = conversation.unread > 0;
  return (
    <Link
      href={`/messages/${conversation.id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand",
        active && "bg-brand-soft/60",
      )}
    >
      <Avatar name={participant.name} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn("flex items-center gap-1 truncate", unread ? "font-bold" : "font-semibold")}>
            {shortName(participant.name)}
            <VerificationBadge verified={participant.verified} compact />
          </p>
          <time
            dateTime={conversation.lastAt}
            className={cn("shrink-0 text-xs", unread ? "font-semibold text-brand" : "text-muted")}
          >
            {formatConversationTime(conversation.lastAt)}
          </time>
        </div>
        <p className="truncate text-xs font-medium text-muted">{subject}</p>
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-sm", unread ? "font-semibold text-foreground" : "text-muted")}>
            {conversation.lastMessage}
          </p>
          {unread && (
            <span className="shrink-0 rounded-full bg-brand px-1.5 text-[11px] leading-5 font-bold text-white">
              {conversation.unread}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
