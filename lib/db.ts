import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { INBOUND_LIKES, PROFILES } from "./seed";
import type { Match, Profile, SwipeAction } from "./types";

// A tiny JSON-file "database". Persists swipes and matches across reloads
// and server restarts. Delete data/db.json (or call POST /api/reset) to start over.

type SwipeRecord = { action: SwipeAction; at: string };
type MatchRecord = { profileId: string; matchedAt: string };
type DbShape = {
  swipes: Record<string, SwipeRecord>; // keyed by profileId
  matches: MatchRecord[];
};

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const emptyDb = (): DbShape => ({ swipes: {}, matches: [] });

const profilesById = new Map(PROFILES.map((p) => [p.id, p]));

async function readDb(): Promise<DbShape> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return { swipes: parsed.swipes ?? {}, matches: parsed.matches ?? [] };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return emptyDb();
    throw err;
  }
}

async function writeDb(db: DbShape): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH); // atomic replace
}

// Serialize all read-modify-write cycles so concurrent swipes can't clobber each other.
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function getProfile(id: string): Profile | undefined {
  return profilesById.get(id);
}

export async function getFeed(): Promise<Profile[]> {
  const db = await readDb();
  return PROFILES.filter((p) => !db.swipes[p.id]);
}

export async function getMatches(): Promise<Match[]> {
  const db = await readDb();
  return db.matches
    .map((m) => {
      const profile = profilesById.get(m.profileId);
      return profile ? { profile, matchedAt: m.matchedAt } : null;
    })
    .filter((m): m is Match => m !== null)
    .sort((a, b) => b.matchedAt.localeCompare(a.matchedAt));
}

// Returns a match only if it is mutual. For any other id (unknown, passed,
// liked one-way, or liked-you-but-not-liked-back) this returns null, so the
// caller can't distinguish those cases.
export async function getMatch(profileId: string): Promise<Match | null> {
  const db = await readDb();
  const record = db.matches.find((m) => m.profileId === profileId);
  const profile = record && profilesById.get(record.profileId);
  return record && profile ? { profile, matchedAt: record.matchedAt } : null;
}

// Where a profile stands for the current user. "swiped" covers both a pass and
// an unreturned like on purpose, so callers can't tell whether someone liked us.
export type ProfileStatus = "unswiped" | "swiped" | "matched";

export async function getProfileWithStatus(
  profileId: string
): Promise<{ profile: Profile; status: ProfileStatus } | null> {
  const profile = profilesById.get(profileId);
  if (!profile) return null;
  const db = await readDb();
  const status: ProfileStatus = db.matches.some((m) => m.profileId === profileId)
    ? "matched"
    : db.swipes[profileId]
      ? "swiped"
      : "unswiped";
  return { profile, status };
}

export class SwipeError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function recordSwipe(
  profileId: string,
  action: SwipeAction
): Promise<{ matched: boolean; match?: Match }> {
  const profile = profilesById.get(profileId);
  if (!profile) throw new SwipeError(404, "Profile not found");

  return withLock(async () => {
    const db = await readDb();
    if (db.swipes[profileId]) {
      throw new SwipeError(409, "Already swiped on this profile");
    }

    const now = new Date().toISOString();
    db.swipes[profileId] = { action, at: now };

    // A match requires BOTH sides to have liked. A pass never reveals anything.
    const matched = action === "like" && INBOUND_LIKES.has(profileId);
    if (matched) db.matches.push({ profileId, matchedAt: now });

    await writeDb(db);
    return matched ? { matched, match: { profile, matchedAt: now } } : { matched };
  });
}

export async function resetDb(): Promise<void> {
  await withLock(() => writeDb(emptyDb()));
}
