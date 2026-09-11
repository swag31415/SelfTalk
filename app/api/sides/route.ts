import { ownerId, unauthorized } from "@/lib/api";
import { sidesForOwner } from "@/lib/journal-sides";

export async function GET() {
  const owner = await ownerId();
  if (!owner) return unauthorized();
  return Response.json(await sidesForOwner(owner));
}
