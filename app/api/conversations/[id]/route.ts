import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";

async function ownedConversation(id: string) { const session = await auth(); if (!session?.user?.id) return null; const [conversation] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.ownerId, session.user.id))).limit(1); return conversation ?? null; }
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const conversation = await ownedConversation((await params).id); return conversation ? Response.json(conversation) : Response.json({ error: "Not found" }, { status: 404 }); }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const conversation = await ownedConversation(id); if (!conversation) return Response.json({ error: "Not found" }, { status: 404 }); await db.delete(conversations).where(eq(conversations.id, id)); return new Response(null, { status: 204 }); }
