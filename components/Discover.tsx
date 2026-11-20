"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Match, Profile, SwipeAction, SwipeResponse } from "@/lib/types";
import { feedStore } from "@/lib/feedStore";
import { haptics } from "@/lib/haptics";
import SwipeCard, { type SwipeCardHandle, type SwipeDir } from "./SwipeCard";
import MatchModal from "./MatchModal";
import { ChatHeartIcon, HeartIcon, XIcon } from "./icons";

// Module-level, so it resets on every full page load but survives in-app navigation
// (e.g. returning from a profile page won't replay the tutorial).
let hintShownThisLoad = false;

type Toast = { id: number; kind: "like" | "pass" | "error"; text: string };

export default function Discover() {
  const [profiles, setProfiles] = useState<Profile[] | null>(() => feedStore.getFeed());
  const [loadError, setLoadError] = useState(false);
  const [exitDir, setExitDir] = useState<SwipeDir>(1);
  const [match, setMatch] = useState<Match | null>(null);
  const [matchCount, setMatchCount] = useState(() => feedStore.getMatchCount() ?? 0);
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();
  // Handles keyed by card element key. A single shared ref broke when the exiting
  // card unmounted and nulled it out from under the new top card.
  const handles = useRef(new Map<string, SwipeCardHandle>());
  const topKey = useRef<string | null>(null);
  const top = useCallback(() => (topKey.current ? (handles.current.get(topKey.current) ?? null) : null), []);
  // Bumped when a failed swipe puts a card back, so it remounts fresh instead of
  // reviving the half-exited instance (which is stuck off-screen in "leaving" state).
  const [retry, setRetry] = useState<Record<string, number>>({});
  // Swipes are sent one at a time, in order. With cookie storage each response
  // rewrites the whole swipe list, so overlapping requests could drop a swipe.
  const swipeQueue = useRef<Promise<unknown>>(Promise.resolve());
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((kind: Toast["kind"], text: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), kind, text });
    toastTimer.current = setTimeout(() => setToast(null), kind === "error" ? 2500 : 1100);
  }, []);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const [feedRes, matchesRes] = await Promise.all([
        fetch("/api/feed", { cache: "no-store" }),
        fetch("/api/matches", { cache: "no-store" }),
      ]);
      if (!feedRes.ok || !matchesRes.ok) throw new Error("load failed");
      const feed = (await feedRes.json()) as { profiles: Profile[] };
      const matches = (await matchesRes.json()) as { matches: Match[] };
      feedStore.setFeed(feed.profiles); // drops any profile whose swipe is still in flight
      setProfiles(feedStore.getFeed());
      setMatchCount(matches.matches.length);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load(); // revalidate in the background even when the cached deck is shown
  }, [load]);

  // Keep the shared cache in step with what's on screen.
  useEffect(() => {
    if (profiles) feedStore.setFeed(profiles);
  }, [profiles]);
  useEffect(() => {
    feedStore.setMatchCount(matchCount);
  }, [matchCount]);

  // Warm the image cache for the next few cards so swipes feel instant.
  useEffect(() => {
    profiles?.slice(2, 5).forEach((p) => {
      const img = new Image();
      img.src = p.photo;
    });
  }, [profiles]);

  const handleSwipe = useCallback(
    async (profile: Profile, dir: SwipeDir) => {
      const action: SwipeAction = dir === 1 ? "like" : "pass";
      setExitDir(dir);
      feedStore.markSwiped(profile.id);
      setProfiles((prev) => prev?.filter((p) => p.id !== profile.id) ?? prev);
      showToast(action, action === "like" ? `Liked ${profile.name}` : `Passed on ${profile.name}`);

      try {
        const send = () =>
          fetch("/api/swipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: profile.id, action }),
          });
        const request = swipeQueue.current.then(send, send);
        swipeQueue.current = request.catch(() => undefined);
        const res = await request;
        if (res.status === 409) return; // already recorded server-side
        if (!res.ok) throw new Error(`swipe failed: ${res.status}`);
        const data = (await res.json()) as SwipeResponse;
        if (data.matched && data.match) {
          haptics.match();
          setMatch(data.match);
          setMatchCount((c) => c + 1);
        }
      } catch {
        // Put the card back so the swipe can be retried.
        feedStore.restore(profile.id);
        setRetry((r) => ({ ...r, [profile.id]: (r[profile.id] ?? 0) + 1 }));
        setProfiles((prev) => (prev ? [profile, ...prev.filter((p) => p.id !== profile.id)] : prev));
        showToast("error", "Couldn't save that swipe. Try again.");
      }
    },
    [showToast]
  );

  const reset = async () => {
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      showToast("error", "Couldn't reset. Try again.");
      return;
    }
    feedStore.clear();
    setRetry({});
    setProfiles(null);
    setMatchCount(0);
    await load();
  };

  const canSwipe = !!profiles?.length && !match;

  // Tutorial: the top card demos a right + left swipe once per page load.
  const [showHint, setShowHint] = useState(false);
  const hintStarted = useRef(false);
  const hintTeardown = useRef<() => void>(() => {});
  useEffect(() => {
    if (hintStarted.current || hintShownThisLoad || !profiles?.length || match) return;
    hintStarted.current = true;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      hintShownThisLoad = true;
      clearTimeout(timer);
      setShowHint(false);
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
    };
    // Any interaction, even before the demo starts, skips it.
    const stop = () => {
      top()?.cancelDemo();
      finish();
    };
    window.addEventListener("pointerdown", stop);
    window.addEventListener("keydown", stop);
    hintTeardown.current = finish;

    timer = setTimeout(() => {
      const card = top();
      if (!card) return finish();
      setShowHint(true);
      card.demo().then(finish);
    }, 250); // just after the first card has sprung in
    // No cleanup here: a background feed refresh must not cancel the scheduled demo.
  }, [profiles, match, top]);
  useEffect(() => () => hintTeardown.current(), []); // only on leaving the page

  // Keyboard support on desktop: ← pass, → like.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!canSwipe) return;
      if (e.key === "ArrowRight") top()?.swipe(1);
      if (e.key === "ArrowLeft") top()?.swipe(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canSwipe, top]);

  const visible = profiles?.slice(0, 2) ?? [];
  const cardKey = (p: Profile) => `${p.id}:${retry[p.id] ?? 0}`;
  topKey.current = visible[0] ? cardKey(visible[0]) : null;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-1">
        <h1 className="text-[22px] font-extrabold tracking-tight">Discover</h1>
        <Link
          href="/discover/matches"
          className="flex items-center gap-1.5 rounded-full border-2 border-ink bg-blush px-3.5 py-1.5 text-sm font-bold transition active:scale-95"
        >
          <ChatHeartIcon className="h-[18px] w-[18px]" />
          Matches
          {matchCount > 0 && (
            <span className="ml-0.5 min-w-5 rounded-full border-2 border-ink bg-brand px-1 text-center text-[11px] font-extrabold leading-4 text-white">
              {matchCount}
            </span>
          )}
        </Link>
      </div>

      {/* Feedback toast */}
      <div className="pointer-events-none absolute inset-x-0 top-14 z-30 flex justify-center">
        <AnimatePresence mode="popLayout">
          {toast && (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ y: -12, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -12, opacity: 0, scale: 0.9 }}
              className={`chunky flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
                toast.kind === "like" ? "bg-blush" : toast.kind === "pass" ? "bg-white" : "bg-peach"
              }`}
            >
              {toast.kind === "like" && <HeartIcon className="h-4 w-4 text-brand" />}
              {toast.kind === "pass" && <XIcon className="h-3.5 w-3.5" />}
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative mx-5 min-h-0 flex-1">
        {profiles === null && !loadError && <CardSkeleton />}

        {loadError && !profiles?.length && (
          <EmptyState title="Something went sideways" body="We couldn't load profiles. Give it another go.">
            <PrimaryButton onClick={load}>Retry</PrimaryButton>
          </EmptyState>
        )}

        {profiles?.length === 0 && !loadError && (
          <EmptyState title="You're all caught up" body="You've seen everyone for now. New people show up here as they join.">
            <PrimaryButton href="/discover/matches">See your matches</PrimaryButton>
            <button onClick={reset} className="text-sm font-bold text-ink/45 underline underline-offset-4 hover:text-ink">
              Reset demo data
            </button>
          </EmptyState>
        )}

        <AnimatePresence custom={exitDir}>
          {visible.map((p, i) => {
            const key = cardKey(p);
            return (
            <SwipeCard
              key={key}
              ref={(h) => {
                if (h) handles.current.set(key, h);
                else handles.current.delete(key);
              }}
              profile={p}
              isTop={i === 0}
              onSwipe={(dir) => handleSwipe(p, dir)}
              onOpen={() => router.push(`/discover/${p.id}`)}
            />
            );
          })}
        </AnimatePresence>

        {/* First-run swipe hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              className="pointer-events-none absolute inset-x-0 bottom-1/3 z-20 flex justify-center"
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
            >
              <div className="chunky flex items-center rounded-full bg-white px-4 py-2.5">
                <span className="text-sm font-bold">
                  Swipe right to like, left to pass
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-6 py-4">
        <ActionButton label="Pass" disabled={!canSwipe} onClick={() => top()?.swipe(-1)} tone="pass">
          <XIcon className="h-6 w-6" />
        </ActionButton>
        <ActionButton label="Like" disabled={!canSwipe} onClick={() => top()?.swipe(1)} tone="like">
          <HeartIcon className="h-7 w-7" />
        </ActionButton>
      </div>

      <MatchModal match={match} onClose={() => setMatch(null)} />
    </div>
  );
}

function ActionButton({
  label,
  tone,
  disabled,
  onClick,
  children,
}: {
  label: string;
  tone: "like" | "pass";
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={`${label} (${tone === "like" ? "→" : "←"})`}
      disabled={disabled}
      onClick={onClick}
      className={`chunky press flex h-16 w-16 items-center justify-center rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-lilac-dot disabled:pointer-events-none disabled:opacity-35 ${
        tone === "like" ? "bg-brand text-white" : "bg-white text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function PrimaryButton({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  const cls = "chunky press w-full rounded-full bg-brand py-3.5 text-center text-[17px] font-bold text-ink";
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="chunky-lg absolute bottom-[6px] left-0 right-[6px] top-0 flex flex-col overflow-y-auto rounded-[28px] bg-white p-4"
    >
      <div className="flex flex-1 flex-col justify-center gap-3 px-2 py-5">
        <h2 className="text-[30px] font-extrabold leading-[1.05] tracking-tight">{title}</h2>
        <p className="text-[15px] font-semibold text-ink/70">{body}</p>
      </div>
      <div className="flex flex-col items-center gap-3 px-1 pb-1">{children}</div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="absolute bottom-[6px] left-0 right-[6px] top-0 animate-pulse rounded-[28px] border-2 border-ink/15 bg-paper"
      aria-label="Loading profiles"
    />
  );
}
