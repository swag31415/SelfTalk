import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";

export async function ownerId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function ownedConversation(id: string) {
  const owner = await ownerId();
  if (!owner) return null;
  const [conversation] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.ownerId, owner))).limit(1);
  return conversation ?? null;
}

export function unauthorized() { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
