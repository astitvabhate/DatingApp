"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Match } from "@/lib/types";
import { ChevronLeftIcon, PinIcon } from "./icons";
import { timeAgo } from "@/lib/time";

const NEW_WINDOW_MS = 24 * 60 * 60 * 1000;

const FRAME_COLORS = ["bg-lilac", "bg-peach", "bg-blush"];

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/matches", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { matches: Match[] }) => setMatches(d.matches))
      .catch(() => setError(true));
  }, []);

  const count = matches?.length ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 pb-2 pt-1">
        <Link
          href="/discover"
          aria-label="Back to Discover"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-white transition active:scale-90"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">Matches</h1>
          {count > 0 && (
            <p className="text-xs font-semibold text-ink/55">
              {count} {count === 1 ? "person" : "people"} liked you back
            </p>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2">
        {error && <p className="py-10 text-center font-semibold text-ink/60">Couldn&apos;t load matches.</p>}

        {!error && matches === null && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-paper" />
            ))}
          </div>
        )}

        {matches?.length === 0 && (
          <div className="chunky-lg rounded-[28px] bg-white p-4">
            <div className="px-2 py-5">
              <h2 className="text-[28px] font-extrabold leading-[1.05] tracking-tight">No matches yet</h2>
              <p className="mt-2 text-[15px] font-semibold text-ink/70">
                When someone you like likes you back, they show up here. Until then, nobody knows a thing.
              </p>
            </div>
            <Link
              href="/discover"
              className="chunky press block rounded-full bg-brand py-3.5 text-center text-[17px] font-bold"
            >
              Start swiping
            </Link>
          </div>
        )}

        {matches && matches.length > 0 && (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-4">
            {matches.map((m, i) => {
              const isNew = Date.now() - new Date(m.matchedAt).getTime() < NEW_WINDOW_MS;
              return (
                <motion.li
                  key={m.profile.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="chunky-sm press rounded-3xl bg-white"
                >
                  <Link href={`/discover/matches/${m.profile.id}`} className="block p-1.5">
                  <div
                    className={`relative aspect-[4/5] overflow-hidden rounded-[18px] ${FRAME_COLORS[i % FRAME_COLORS.length]}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.profile.photo} alt={m.profile.name} className="h-full w-full object-cover" />
                    <span
                      className={`absolute left-2 top-2 rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-extrabold leading-none ${
                        isNew ? "bg-brand text-white" : "bg-white text-ink"
                      }`}
                    >
                      {isNew ? "New" : timeAgo(m.matchedAt)}
                    </span>
                  </div>
                  <div className="px-1.5 pb-1 pt-2">
                    <p className="truncate text-base font-extrabold leading-tight">
                      {m.profile.name}
                      <span className="font-semibold text-ink/45">, {m.profile.age}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-ink/55">
                      <PinIcon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{m.profile.location}</span>
                    </p>
                  </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
