"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from "framer-motion";
import { haptics } from "@/lib/haptics";
import type { Profile } from "@/lib/types";
import { PinIcon } from "./icons";

export type SwipeDir = 1 | -1; // 1 = like (right), -1 = pass (left)
export type SwipeCardHandle = {
  swipe: (dir: SwipeDir) => void;
  /** First-run tutorial: lean right (LIKE), back, lean left (NOPE), back. Resolves when done or cancelled. */
  demo: () => Promise<void>;
  cancelDemo: () => void;
};

type Props = {
  profile: Profile;
  isTop: boolean;
  onSwipe: (dir: SwipeDir) => void;
  /** Open the full profile (tap on the card). */
  onOpen?: () => void;
};

const DISTANCE_THRESHOLD = 110; // px
const VELOCITY_THRESHOLD = 600; // px/s
const CHIP_COLORS = ["bg-lilac", "bg-peach", "bg-blush"];

const SwipeCard = forwardRef<SwipeCardHandle, Props>(function SwipeCard({ profile, isTop, onSwipe, onOpen }, ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [20, DISTANCE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-DISTANCE_THRESHOLD, -20], [1, 0]);
  const likeScale = useTransform(x, [20, DISTANCE_THRESHOLD], [0.6, 1]);
  const nopeScale = useTransform(x, [-DISTANCE_THRESHOLD, -20], [1, 0.6]);
  const leaving = useRef(false);
  const dragged = useRef(false); // distinguishes a tap from the end of a drag
  const zone = useRef<-1 | 0 | 1>(0); // which side of the commit threshold the card is on

  // Light tick each time a drag crosses into the like / pass zone.
  useMotionValueEvent(x, "change", (v) => {
    const next = v > DISTANCE_THRESHOLD ? 1 : v < -DISTANCE_THRESHOLD ? -1 : 0;
    if (next !== zone.current) {
      if (next !== 0 && dragged.current && !leaving.current) haptics.tick();
      zone.current = next;
    }
  });

  const commit = (dir: SwipeDir) => {
    if (leaving.current) return;
    leaving.current = true;
    if (dir === 1) haptics.like();
    else haptics.pass();
    onSwipe(dir);
  };

  // Button / keyboard swipe: nudge the card so the LIKE/NOPE sticker shows, then fling it.
  const demoCancelled = useRef(false);
  const flinging = useRef(false); // a button/key swipe is animating out
  const stopDemo = () => {
    demoCancelled.current = true;
    x.stop();
  };

  useImperativeHandle(ref, () => ({
    swipe: (dir) => {
      if (leaving.current || flinging.current) return;
      flinging.current = true;
      stopDemo();
      animate(x, dir * (DISTANCE_THRESHOLD + 30), { duration: 0.18, ease: "easeOut" }).then(() => commit(dir));
    },
    demo: async () => {
      demoCancelled.current = false;
      for (const to of [DISTANCE_THRESHOLD - 10, 0, -(DISTANCE_THRESHOLD - 10), 0]) {
        if (demoCancelled.current || leaving.current) return;
        await animate(x, to, { duration: 0.5, ease: "easeInOut" });
        if (to !== 0 && !demoCancelled.current) await new Promise((r) => setTimeout(r, 350));
      }
    },
    cancelDemo: () => {
      if (demoCancelled.current) return;
      stopDemo();
      if (!leaving.current && !dragged.current) animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    },
  }));

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x > DISTANCE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) return commit(1);
    if (offset.x < -DISTANCE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) return commit(-1);
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    animate(y, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  return (
    <motion.div
      className={`chunky-lg absolute bottom-[6px] left-0 right-[6px] top-0 flex select-none flex-col overflow-hidden rounded-[28px] bg-white ${
        isTop ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none"
      }`}
      style={{ x, y, rotate, zIndex: isTop ? 2 : 1 }}
      drag={isTop}
      dragMomentum={false}
      onDragStart={() => {
        dragged.current = true;
        stopDemo();
      }}
      onDragEnd={handleDragEnd}
      onTapStart={() => (dragged.current = false)}
      onTap={() => {
        if (isTop && !dragged.current && !leaving.current) onOpen?.();
      }}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      variants={{
        exit: (dir: SwipeDir) => ({
          x: dir * 600,
          y: y.get() + 40,
          opacity: 0,
          transition: { duration: 0.35, ease: "easeIn" },
        }),
      }}
      exit="exit"
      aria-hidden={!isTop}
    >
      {/* Photo, framed like the brand's lilac panel */}
      <div className="relative m-3 mb-0 min-h-0 flex-1 overflow-hidden rounded-[20px] border-2 border-ink bg-lilac">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo}
          alt={`${profile.name}, ${profile.age}`}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
        />

        {/* Swipe feedback stickers */}
        <motion.div
          style={{ opacity: likeOpacity, scale: likeScale }}
          className="chunky pointer-events-none absolute left-4 top-5 -rotate-12 rounded-2xl bg-brand px-4 py-1.5 text-2xl font-extrabold tracking-wide text-white"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: nopeOpacity, scale: nopeScale }}
          className="chunky pointer-events-none absolute right-4 top-5 rotate-12 rounded-2xl bg-white px-4 py-1.5 text-2xl font-extrabold tracking-wide text-ink"
        >
          NOPE
        </motion.div>
      </div>

      <div className="pointer-events-none space-y-2 px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="truncate text-[28px] font-extrabold leading-none tracking-tight">
            {profile.name}
            <span className="font-semibold text-ink/50">, {profile.age}</span>
          </h2>
        </div>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink/70">
          <PinIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{profile.location}</span>
        </p>
        <p className="line-clamp-2 text-[15px] font-medium leading-snug text-ink/85">{profile.bio}</p>
        <ul className="flex flex-wrap gap-1.5 pt-1">
          {profile.interests.map((interest, i) => (
            <li
              key={interest}
              className={`rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold ${CHIP_COLORS[i % CHIP_COLORS.length]}`}
            >
              {interest}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
});

export default SwipeCard;
