import { db } from "@/lib/db";
import { conversations, journalSides, messageReactions, messages } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  const owner = await ownerId();
  if (!owner) return unauthorized();
  const data = await request.json();
  if (!Array.isArray(data.sides) || !Array.isArray(data.conversations) || !Array.isArray(data.messages)) return Response.json({ error: "Invalid SelfTalk export" }, { status: 400 });
  const sideMap = new Map<string, string>();
  for (const input of data.sides) {
    const id = crypto.randomUUID(); sideMap.set(String(input.id), id);
    await db.insert(journalSides).values({ id, ownerId: owner, name: String(input.name || "Imported side").slice(0, 40), color: String(input.color || "#668bb7").slice(0, 16), position: Number(input.position) || 0, archivedAt: input.archivedAt ? new Date(input.archivedAt) : null });
  }
  const conversationMap = new Map<string, string>();
  for (const input of data.conversations) {
    const id = crypto.randomUUID(); conversationMap.set(String(input.id), id);
    await db.insert(conversations).values({ id, ownerId: owner, title: String(input.title || "Imported conversation").slice(0, 120), position: Number(input.position) || 0, archivedAt: input.archivedAt ? new Date(input.archivedAt) : null });
  }
  const messageMap = new Map<string, string>();
  for (const input of data.messages) {
    const conversationId = conversationMap.get(String(input.conversationId)); const authorSideId = sideMap.get(String(input.authorSideId));
    if (conversationId && authorSideId) { const id = crypto.randomUUID(); messageMap.set(String(input.id), id); await db.insert(messages).values({ id, conversationId, authorSideId, body: String(input.body || "").slice(0, 10000), replyToMessageId: messageMap.get(String(input.replyToMessageId)) || null, deletedAt: input.deletedAt ? new Date(input.deletedAt) : null }); }
  }
  if (Array.isArray(data.reactions)) for (const input of data.reactions) { const messageId = messageMap.get(String(input.messageId)); const sideId = sideMap.get(String(input.sideId)); const reaction = String(input.reaction || "").slice(0, 12); if (messageId && sideId && reaction) await db.insert(messageReactions).values({ messageId, sideId, reaction }).onConflictDoNothing(); }
  return Response.json({ imported: true });
}
