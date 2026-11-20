import { NextResponse } from "next/server";
import { storageStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/health — which storage backend is active (never exposes credentials).
export async function GET() {
  const status = await storageStatus();
  return NextResponse.json(status, { status: status.ok ? 200 : 500, headers: { "Cache-Control": "no-store" } });
}
