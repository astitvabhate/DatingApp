"use client";

import type { Profile } from "./types";

// Tiny in-memory client cache for the Discover deck, so navigating
// /discover -> /discover/[id] -> /discover is instant (no skeleton/refetch wait).
// `pending` holds ids whose swipe POST is still in flight: they're filtered out
// of any feed response so a swiped profile can never flash back in.

let feed: Profile[] | null = null;
let matchCount: number | null = null;
const pending = new Set<string>();

const visible = (list: Profile[]) => list.filter((p) => !pending.has(p.id));

export const feedStore = {
  getFeed: () => (feed ? visible(feed) : null),
  setFeed: (list: Profile[]) => {
    feed = visible(list);
  },
  getMatchCount: () => matchCount,
  setMatchCount: (n: number) => {
    matchCount = n;
  },
  /** Drop a profile from the cached deck and hide it until its swipe is saved. */
  markSwiped: (id: string) => {
    pending.add(id);
    if (feed) feed = feed.filter((p) => p.id !== id);
  },
  settle: (id: string) => {
    pending.delete(id);
  },
  /** Swipe failed: allow the profile back into future feed responses. */
  restore: (id: string) => {
    pending.delete(id);
  },
};
