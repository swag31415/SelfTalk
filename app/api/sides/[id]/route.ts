import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { journalSides } from "@/lib/db/schema";
import { ownerId, unauthorized } from "@/lib/api";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const owner = await ownerId();
  if (!owner) return unauthorized();
  const id = (await params).id;
  const [side] = await db.select().from(journalSides).where(and(eq(journalSides.id, id), eq(journalSides.ownerId, owner), isNull(journalSides.archivedAt))).limit(1);
  if (!side) return Response.json({ error: "Not found" }, { status: 404 });
  const active = await db.select({ id: journalSides.id }).from(journalSides).where(and(eq(journalSides.ownerId, owner), isNull(journalSides.archivedAt)));
  if (active.length <= 1) return Response.json({ error: "Keep at least one side" }, { status: 400 });
  await db.update(journalSides).set({ archivedAt: new Date() }).where(eq(journalSides.id, id));
  return new Response(null, { status: 204 });
}
