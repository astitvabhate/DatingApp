import "server-only";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { Redis } from "@upstash/redis";
import { INBOUND_LIKES, PROFILES } from "./seed";
import type { Match, Profile, SwipeAction } from "./types";

// Persistence for swipes and matches, with two interchangeable backends:
//
// - Redis (Upstash): used whenever its REST credentials are set. Required for
//   real persistence on serverless hosts like Vercel, whose filesystem is
//   read-only and not shared between instances.
// - JSON file: local development (data/db.json). On Vercel without Redis it
//   falls back to /tmp so swipes don't error, but that data is per-instance
//   and temporary.
//
// Profiles themselves are static seed data (lib/seed.ts).

type SwipeRecord = { action: SwipeAction; at: string };
type MatchRecord = { profileId: string; matchedAt: string };
type Snapshot = { swipes: Record<string, SwipeRecord>; matches: MatchRecord[] };

interface Store {
  read(): Promise<Snapshot>;
  /** Atomically record a swipe. Returns false if this profile was already swiped. */
  addSwipe(profileId: string, record: SwipeRecord, match: MatchRecord | null): Promise<boolean>;
  reset(): Promise<void>;
}

// ---------------------------------------------------------------- Redis store

function redisFromEnv(): Redis | null {
  // Vercel's Upstash integration sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const SWIPES_KEY = "coy:swipes"; // hash: profileId -> SwipeRecord
const MATCHES_KEY = "coy:matches"; // hash: profileId -> matchedAt

// KEYS[1]=swipes, KEYS[2]=matches; ARGV[1]=profileId, ARGV[2]=swipe JSON, ARGV[3]=matchedAt or ""
const ADD_SWIPE_SCRIPT = `
if redis.call('HSETNX', KEYS[1], ARGV[1], ARGV[2]) == 0 then return 0 end
if ARGV[3] ~= '' then redis.call('HSET', KEYS[2], ARGV[1], ARGV[3]) end
return 1
`;

function redisStore(redis: Redis): Store {
  return {
    async read() {
      const [swipes, matches] = await Promise.all([
        redis.hgetall<Record<string, SwipeRecord>>(SWIPES_KEY),
        redis.hgetall<Record<string, string>>(MATCHES_KEY),
      ]);
      return {
        swipes: swipes ?? {},
        matches: Object.entries(matches ?? {}).map(([profileId, matchedAt]) => ({ profileId, matchedAt })),
      };
    },
    async addSwipe(profileId, record, match) {
      // One Lua script = one atomic step: the swipe and its match are written
      // together or not at all, and a second swipe on the same profile is
      // rejected (HSETNX) even across serverless instances.
      const created = await redis.eval(
        ADD_SWIPE_SCRIPT,
        [SWIPES_KEY, MATCHES_KEY],
        [profileId, JSON.stringify(record), match?.matchedAt ?? ""]
      );
      return Number(created) === 1;
    },
    async reset() {
      await redis.del(SWIPES_KEY, MATCHES_KEY);
    },
  };
}

// ----------------------------------------------------------------- File store

function fileStore(filePath: string): Store {
  const empty = (): Snapshot => ({ swipes: {}, matches: [] });

  const read = async (): Promise<Snapshot> => {
    try {
      const parsed = JSON.parse(await fs.readFile(filePath, "utf8")) as Partial<Snapshot>;
      return { swipes: parsed.swipes ?? {}, matches: parsed.matches ?? [] };
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return empty();
      throw err;
    }
  };

  const write = async (db: Snapshot) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmp = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, filePath); // atomic replace
  };

  // Serialize read-modify-write cycles so concurrent swipes can't clobber each other.
  let queue: Promise<unknown> = Promise.resolve();
  const withLock = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.then(fn, fn);
    queue = run.catch(() => undefined);
    return run;
  };

  return {
    read,
    addSwipe: (profileId, record, match) =>
      withLock(async () => {
        const db = await read();
        if (db.swipes[profileId]) return false;
        db.swipes[profileId] = record;
        if (match) db.matches.push(match);
        await write(db);
        return true;
      }),
    reset: () => withLock(() => write(empty())),
  };
}

// ------------------------------------------------------------- Store choice

let store: Store | null = null;
function getStore(): Store {
  if (store) return store;
  const redis = redisFromEnv();
  if (redis) {
    store = redisStore(redis);
  } else if (process.env.VERCEL) {
    console.warn("[db] No Redis configured on Vercel; using /tmp (temporary, per-instance). Add Upstash Redis for persistence.");
    store = fileStore(path.join(os.tmpdir(), "coy-db.json"));
  } else {
    store = fileStore(path.join(process.cwd(), "data", "db.json"));
  }
  return store;
}

// ------------------------------------------------------------------ Queries

const profilesById = new Map(PROFILES.map((p) => [p.id, p]));

export function getProfile(id: string): Profile | undefined {
  return profilesById.get(id);
}

export async function getFeed(): Promise<Profile[]> {
  const { swipes } = await getStore().read();
  return PROFILES.filter((p) => !swipes[p.id]);
}

export async function getMatches(): Promise<Match[]> {
  const { matches } = await getStore().read();
  return matches
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
  const { matches } = await getStore().read();
  const record = matches.find((m) => m.profileId === profileId);
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
  const { swipes, matches } = await getStore().read();
  const status: ProfileStatus = matches.some((m) => m.profileId === profileId)
    ? "matched"
    : swipes[profileId]
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

  const now = new Date().toISOString();
  // A match requires BOTH sides to have liked. A pass never reveals anything.
  const matched = action === "like" && INBOUND_LIKES.has(profileId);

  const created = await getStore().addSwipe(
    profileId,
    { action, at: now },
    matched ? { profileId, matchedAt: now } : null
  );
  if (!created) throw new SwipeError(409, "Already swiped on this profile");

  return matched ? { matched, match: { profile, matchedAt: now } } : { matched };
}

export async function resetDb(): Promise<void> {
  await getStore().reset();
}
