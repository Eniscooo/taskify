import { ConversationList } from "@/components/messaging/conversation-list";
import { loadConversationRows } from "@/lib/loaders";

/** Two-pane inbox on desktop; on mobile each route is full-screen. */
export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const rows = await loadConversationRows();
  return (
    <div className="md:grid md:h-[calc(100dvh-7.5rem)] md:grid-cols-[340px_1fr] md:overflow-hidden md:rounded-3xl md:border md:border-border md:bg-surface">
      <aside aria-label="Conversations" className="hidden overflow-y-auto border-r border-border md:block">
        <h2 className="sticky top-0 border-b border-border bg-surface px-4 py-4 text-lg font-bold">Messages</h2>
        <ConversationList rows={rows} />
      </aside>
      <div className="min-w-0 md:overflow-hidden">{children}</div>
    </div>
  );
}
