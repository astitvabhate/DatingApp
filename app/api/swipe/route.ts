import { NextResponse } from "next/server";
import { recordSwipe, SwipeError } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /swipe { profileId, action: "like" | "pass" } -> { matched, match? }
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { profileId, action } = (body ?? {}) as { profileId?: unknown; action?: unknown };
  if (typeof profileId !== "string" || (action !== "like" && action !== "pass")) {
    return NextResponse.json(
      { error: 'Expected { profileId: string, action: "like" | "pass" }' },
      { status: 400 }
    );
  }

  try {
    const result = await recordSwipe(profileId, action);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SwipeError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
