import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { ownedConversation } from "@/lib/api";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const conversation = await ownedConversation((await params).id); return conversation ? Response.json(conversation) : Response.json({ error: "Not found" }, { status: 404 }); }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const id = (await params).id; const conversation = await ownedConversation(id); if (!conversation) return Response.json({ error: "Not found" }, { status: 404 }); const { title } = await request.json(); const value = String(title || "").trim().slice(0, 120); if (!value) return Response.json({ error: "A title is required" }, { status: 400 }); await db.update(conversations).set({ title: value, updatedAt: new Date() }).where(eq(conversations.id, id)); return Response.json({ ...conversation, title: value }); }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const conversation = await ownedConversation(id); if (!conversation) return Response.json({ error: "Not found" }, { status: 404 }); await db.delete(conversations).where(eq(conversations.id, id)); return new Response(null, { status: 204 }); }
