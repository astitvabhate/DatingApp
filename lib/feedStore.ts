"use client";

import type { Profile } from "./types";

// Tiny in-memory client cache for the Discover deck, so navigating
// /discover -> /discover/[id] -> /discover is instant (no skeleton/refetch wait).
//
// `swiped` remembers every profile swiped during this page load. Feed responses
// are always filtered through it, so a response that was requested *before* a
// swipe (but arrives after) can never bring a swiped profile back.

let feed: Profile[] | null = null;
let matchCount: number | null = null;
const swiped = new Set<string>();

const visible = (list: Profile[]) => list.filter((p) => !swiped.has(p.id));

export const feedStore = {
  getFeed: () => (feed ? visible(feed) : null),
  setFeed: (list: Profile[]) => {
    feed = visible(list);
  },
  getMatchCount: () => matchCount,
  setMatchCount: (n: number) => {
    matchCount = n;
  },
  /** Drop a profile from the cached deck and keep it out of every later feed response. */
  markSwiped: (id: string) => {
    swiped.add(id);
    if (feed) feed = feed.filter((p) => p.id !== id);
  },
  /** Swipe failed to save: allow the profile back into the deck. */
  restore: (id: string) => {
    swiped.delete(id);
  },
  /** Demo reset: forget everything. */
  clear: () => {
    swiped.clear();
    feed = null;
    matchCount = null;
  },
};
