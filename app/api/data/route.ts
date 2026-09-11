import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, journalSides, messageReactions, messages, preferences } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";

export async function DELETE() {
  const owner = await ownerId();
  if (!owner) return unauthorized();
  const ownedConversations = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.ownerId, owner));
  const conversationIds = ownedConversations.map((conversation) => conversation.id);
  const ownedMessages = conversationIds.length ? await db.select({ id: messages.id }).from(messages).where(inArray(messages.conversationId, conversationIds)) : [];
  const messageIds = ownedMessages.map((message) => message.id);
  await db.transaction(async (tx) => {
    if (messageIds.length) await tx.delete(messageReactions).where(inArray(messageReactions.messageId, messageIds));
    if (conversationIds.length) await tx.delete(messages).where(inArray(messages.conversationId, conversationIds));
    await tx.delete(conversations).where(eq(conversations.ownerId, owner));
    await tx.delete(journalSides).where(eq(journalSides.ownerId, owner));
    await tx.delete(preferences).where(eq(preferences.ownerId, owner));
  });
  return new Response(null, { status: 204 });
}
