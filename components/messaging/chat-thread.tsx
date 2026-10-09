"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { SafetyTip } from "@/components/payments/safety-notice";
import { Avatar } from "@/components/ui/avatar";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { sendMessage } from "@/lib/api";
import { CURRENT_USER_ID } from "@/lib/constants";
import { dayGroup, formatDate, shortName } from "@/lib/formatters";
import type { Message, User } from "@/lib/types";
import { ChatBubble, TypingIndicator } from "./chat-bubble";
import { ChatComposer } from "./chat-composer";
import { ChatMenu } from "./chat-menu";

const AUTO_REPLIES = [
  "Okay, no problem 👍",
  "Let me check and get back to you.",
  "Alright. Please pay through the app so we're both protected.",
];

/**
 * Chat screen. In production, new messages and typing events arrive over
 * the WebSocket gateway; here the other side "replies" after a short delay.
 */
export function ChatThread({
  conversationId,
  participant,
  initialMessages,
  context,
}: {
  conversationId: string;
  participant: User;
  initialMessages: Message[];
  context?: React.ReactNode;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const replyIdx = useRef(0);
  const firstName = shortName(participant.name);

  // Scroll only the message pane (scrollIntoView would also scroll ancestors).
  // Layout effect so the first paint already shows the newest message.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (messages.length > initialMessages.length || typing) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else el.scrollTop = el.scrollHeight;
  }, [messages, typing, initialMessages.length]);

  const send = async (body: string, image?: boolean) => {
    const msg = await sendMessage(conversationId, body, image);
    setMessages((m) => [...m, msg]);
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `reply-${Date.now()}`,
          conversationId,
          senderId: participant.id,
          body: AUTO_REPLIES[replyIdx.current++ % AUTO_REPLIES.length]!,
          sentAt: new Date().toISOString(),
        },
      ]);
    }, 2600);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background md:static md:z-auto md:h-full">
      <header className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2">
        <Link
          href="/messages"
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand md:hidden"
        >
          <ArrowLeft aria-hidden className="h-5 w-5" />
          <span className="sr-only">Back to messages</span>
        </Link>
        <Link
          href={`/profile/${participant.username}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 pl-1 focus-visible:outline-2 focus-visible:outline-brand md:pl-2"
        >
          <Avatar name={participant.name} online />
          <div className="min-w-0">
            <h1 className="flex items-center gap-1 truncate font-bold">
              {firstName}
              <VerificationBadge verified={participant.verified} compact />
            </h1>
            <p className="truncate text-xs text-muted">
              ★ {participant.rating.toFixed(1)} · {participant.responseTime}
            </p>
          </div>
        </Link>
        <ChatMenu name={firstName} />
      </header>

      {context}

      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4" aria-live="polite" aria-label="Messages">
        <SafetyTip className="mx-auto mb-4 max-w-md">
          Never send money outside Naija Market. Pay in the app so your money is held safely until you confirm.
        </SafetyTip>
        {messages.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">Say hello to {firstName} 👋</p>
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showDay = !prev || formatDate(prev.sentAt) !== formatDate(m.sentAt);
          return (
            <Fragment key={m.id}>
              {showDay && (
                <p className="py-2 text-center text-xs font-semibold text-muted">
                  {dayGroup(m.sentAt) === "Earlier" ? formatDate(m.sentAt, { weekday: "short", day: "numeric", month: "short" }) : dayGroup(m.sentAt)}
                </p>
              )}
              <ChatBubble message={m} mine={m.senderId === CURRENT_USER_ID} />
            </Fragment>
          );
        })}
        {typing && <TypingIndicator name={firstName} />}
      </div>

      <ChatComposer onSend={send} showQuickReplies={messages.length < 2} />
    </div>
  );
}
