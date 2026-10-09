import { MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ConversationList } from "@/components/messaging/conversation-list";
import { SafetyTip } from "@/components/payments/safety-notice";
import { loadConversationRows } from "@/lib/loaders";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const rows = await loadConversationRows();
  return (
    <>
      {/* Mobile: the inbox itself */}
      <div className="md:hidden">
        <PageHeader title="Messages" />
        <SafetyTip className="mb-3">Never send money outside Naija Market.</SafetyTip>
        <div className="-mx-4 border-y border-border bg-surface">
          <ConversationList rows={rows} />
        </div>
      </div>
      {/* Desktop: empty right pane */}
      <div className="hidden h-full flex-col items-center justify-center p-8 text-center md:flex">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
          <MessagesSquare aria-hidden className="h-7 w-7 text-brand" />
        </span>
        <h1 className="text-lg font-bold">Your messages</h1>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Pick a conversation to continue. Remember: never send money outside Naija Market.
        </p>
      </div>
    </>
  );
}
