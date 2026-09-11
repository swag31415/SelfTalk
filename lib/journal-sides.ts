import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { journalSides } from "@/lib/db/schema";
import { FIXED_SIDES } from "@/lib/sides";

export async function sidesForOwner(ownerId: string) {
  const existing = await db.select().from(journalSides).where(eq(journalSides.ownerId, ownerId));
  if (!existing.length) {
    await db.insert(journalSides).values(FIXED_SIDES.map((side, position) => ({
      id: crypto.randomUUID(), ownerId, ...side, position, isEnabled: 1,
    })));
  }
  return db.select().from(journalSides).where(eq(journalSides.ownerId, ownerId)).orderBy(asc(journalSides.position));
}
