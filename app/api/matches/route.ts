import { NextResponse } from "next/server";
import { getMatches } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /matches — mutual matches only, newest first.
export async function GET() {
  const matches = await getMatches();
  return NextResponse.json({ matches }, { headers: { "Cache-Control": "no-store" } });
}
