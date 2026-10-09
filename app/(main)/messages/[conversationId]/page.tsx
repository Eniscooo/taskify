import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatContextCard } from "@/components/messaging/chat-context-card";
import { ChatThread } from "@/components/messaging/chat-thread";
import { ButtonLink } from "@/components/ui/button";
import { getConversation, getListing, getTask, getUser, staticIds } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/constants";
import { serviceLabel } from "@/lib/formatters";

export function generateStaticParams() {
  return staticIds.conversations();
}

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage({ params }: PageProps<"/messages/[conversationId]">) {
  const { conversationId } = await params;
  const data = await getConversation(conversationId);
  if (!data) notFound();

  const { conversation, messages } = data;
  const [participant, listing, task] = await Promise.all([
    getUser(conversation.participantId),
    conversation.listingId ? getListing(conversation.listingId) : null,
    conversation.taskId ? getTask(conversation.taskId) : null,
  ]);
  if (!participant) notFound();

  const context = listing ? (
    <ChatContextCard
      href={`/marketplace/listing/${listing.id}`}
      title={listing.title}
      price={listing.price}
      meta={listing.area}
      action={
        listing.sellerId === CURRENT_USER_ID ? (
          <ButtonLink href="/orders?tab=selling" size="sm" variant="secondary">
            Orders
          </ButtonLink>
        ) : (
          <ButtonLink href={`/marketplace/listing/${listing.id}`} size="sm">
            Buy now
          </ButtonLink>
        )
      }
    />
  ) : task ? (
    <ChatContextCard
      href={`/hire/task/${task.id}`}
      title={task.title}
      price={task.budget}
      meta={`${serviceLabel(task.service)} · ${task.area}`}
      action={
        <ButtonLink href={`/hire/task/${task.id}`} size="sm" variant="secondary">
          View offers
        </ButtonLink>
      }
    />
  ) : null;

  return (
    <ChatThread
      conversationId={conversation.id}
      participant={participant}
      initialMessages={messages}
      context={context}
    />
  );
}
