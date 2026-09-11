import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { journalSides } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";
import { sidesForOwner } from "@/lib/journal-sides";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await ownerId();
  if (!owner) return unauthorized();
  const id = (await params).id;
  await sidesForOwner(owner);
  const [side] = await db.select().from(journalSides).where(and(eq(journalSides.id, id), eq(journalSides.ownerId, owner))).limit(1);
  if (!side) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  const isEnabled = body.isEnabled ? 1 : 0;
  const enabled = await db.select({ id: journalSides.id }).from(journalSides).where(and(eq(journalSides.ownerId, owner), eq(journalSides.isEnabled, 1)));
  if (!isEnabled && side.isEnabled && enabled.length <= 1) return Response.json({ error: "Keep at least one side available" }, { status: 400 });
  const [updated] = await db.update(journalSides).set({ isEnabled }).where(eq(journalSides.id, id)).returning();
  return Response.json(updated);
}
