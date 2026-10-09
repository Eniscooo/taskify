/**
 * View-model loaders that combine several API calls for a screen.
 * Kept separate from api.ts so the API layer stays a thin endpoint mirror.
 */
import { getConversations, getListing, getTask, getUser } from "./api";
import type { ConversationRow } from "./types";

export async function loadConversationRows(): Promise<ConversationRow[]> {
  const conversations = await getConversations();
  const rows = await Promise.all(
    conversations.map(async (conversation) => {
      const [participant, listing, task] = await Promise.all([
        getUser(conversation.participantId),
        conversation.listingId ? getListing(conversation.listingId) : null,
        conversation.taskId ? getTask(conversation.taskId) : null,
      ]);
      if (!participant) return null;
      return { conversation, participant, subject: listing?.title ?? task?.title ?? "General" };
    }),
  );
  return rows.filter((r): r is ConversationRow => r !== null);
}
