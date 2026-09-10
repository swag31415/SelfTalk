import { db } from "@/lib/db";
import { conversations, journalSides, messages } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";

export async function POST(request: Request) {
  const owner = await ownerId();
  if (!owner) return unauthorized();
  const data = await request.json();
  if (!Array.isArray(data.sides) || !Array.isArray(data.conversations) || !Array.isArray(data.messages)) return Response.json({ error: "Invalid SelfTalk export" }, { status: 400 });
  const sideMap = new Map<string, string>();
  for (const input of data.sides) {
    const id = crypto.randomUUID(); sideMap.set(String(input.id), id);
    await db.insert(journalSides).values({ id, ownerId: owner, name: String(input.name || "Imported side").slice(0, 40), color: String(input.color || "#668bb7").slice(0, 16), position: Number(input.position) || 0 });
  }
  const conversationMap = new Map<string, string>();
  for (const input of data.conversations) {
    const id = crypto.randomUUID(); conversationMap.set(String(input.id), id);
    await db.insert(conversations).values({ id, ownerId: owner, title: String(input.title || "Imported conversation").slice(0, 120), archivedAt: input.archivedAt ? new Date(input.archivedAt) : null });
  }
  for (const input of data.messages) {
    const conversationId = conversationMap.get(String(input.conversationId)); const authorSideId = sideMap.get(String(input.authorSideId));
    if (conversationId && authorSideId) await db.insert(messages).values({ id: crypto.randomUUID(), conversationId, authorSideId, body: String(input.body || "").slice(0, 10000) });
  }
  return Response.json({ imported: true });
}
