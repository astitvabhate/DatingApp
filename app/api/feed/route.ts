import { NextResponse } from "next/server";
import { getFeed } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /feed — profiles the user has not swiped on yet.
export async function GET() {
  const profiles = await getFeed();
  return NextResponse.json({ profiles }, { headers: { "Cache-Control": "no-store" } });
}
