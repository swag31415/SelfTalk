import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";

export async function GET(request: Request) {
  const owner = await ownerId(); if (!owner) return unauthorized();
  const archived = new URL(request.url).searchParams.get("archived") === "true";
  return Response.json(await db.select().from(conversations).where(and(eq(conversations.ownerId, owner), archived ? undefined : isNull(conversations.archivedAt))).orderBy(asc(conversations.position), desc(conversations.updatedAt)));
}
export async function POST(request: Request) {
  const owner = await ownerId(); if (!owner) return unauthorized();
  const { title } = await request.json(); const conversation = { id: crypto.randomUUID(), ownerId: owner, title: String(title || "Untitled conversation").trim().slice(0, 120) || "Untitled conversation", position: 0 };
  await db.insert(conversations).values(conversation); return Response.json(conversation, { status: 201 });
}
export async function PATCH(request: Request) {
  const owner = await ownerId(); if (!owner) return unauthorized();
  const order = (await request.json()).order;
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) return Response.json({ error: "Invalid conversation order" }, { status: 400 });
  const owned = await db.select({ id: conversations.id }).from(conversations).where(and(eq(conversations.ownerId, owner), isNull(conversations.archivedAt)));
  if (order.length !== owned.length || new Set(order).size !== order.length || order.some((id) => !owned.some((item) => item.id === id))) return Response.json({ error: "Invalid conversation order" }, { status: 400 });
  await Promise.all(order.map((id, position) => db.update(conversations).set({ position }).where(eq(conversations.id, id))));
  return Response.json({ order });
}
