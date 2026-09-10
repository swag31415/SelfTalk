import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const owner = await ownerId(); if (!owner) return unauthorized();
  const archived = new URL(request.url).searchParams.get("archived") === "true";
  return Response.json(await db.select().from(conversations).where(and(eq(conversations.ownerId, owner), archived ? undefined : isNull(conversations.archivedAt))).orderBy(desc(conversations.updatedAt)));
}
export async function POST(request: Request) {
  const owner = await ownerId(); if (!owner) return unauthorized();
  const { title } = await request.json(); const conversation = { id: crypto.randomUUID(), ownerId: owner, title: String(title || "Untitled conversation").trim().slice(0, 120) || "Untitled conversation" };
  await db.insert(conversations).values(conversation); return Response.json(conversation, { status: 201 });
}
