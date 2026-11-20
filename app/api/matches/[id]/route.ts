import { NextResponse } from "next/server";
import { getMatch } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /matches/:id — a single mutual match. Anything that isn't a mutual
// match returns the same 404, so this can't be used to probe one-way likes.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatch(id);
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  return NextResponse.json({ match }, { headers: { "Cache-Control": "no-store" } });
}
