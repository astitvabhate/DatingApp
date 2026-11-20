import { NextResponse } from "next/server";
import { resetDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/reset — demo helper: clears all swipes and matches.
export async function POST() {
  await resetDb();
  return NextResponse.json({ ok: true });
}
