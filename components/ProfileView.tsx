"use client";

import { motion, useMotionValue, useTransform, type Variants } from "framer-motion";
import type { Profile } from "@/lib/types";
import { HeartIcon, PinIcon } from "./icons";
import SideQuests from "./SideQuests";

// Same spring the Discover cards use, so the two screens feel like one system.
const SPRING = { type: "spring", stiffness: 300, damping: 28 } as const;

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

// Shared animated profile layout for /discover/[id] and /discover/matches/[id].
type Props = { profile: Profile; matchedLabel?: string };

export default function ProfileView({ profile, matchedLabel }: Props) {
  // Draggable photo card: tilts like a Discover card, then springs back.
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Photo card */}
      <motion.div
        className="chunky-lg mr-[6px] cursor-grab rounded-[28px] bg-white p-2.5 active:cursor-grabbing"
        style={{ x, rotate }}
        drag="x"
        dragSnapToOrigin
        dragElastic={0.5}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 22 }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border-2 border-ink bg-lilac">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.photo}
            alt={profile.name}
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-cover"
          />
          {matchedLabel && (
          <motion.span
            className="absolute left-3 top-3 flex items-center gap-1 rounded-full border-2 border-ink bg-brand px-2.5 py-1 text-xs font-extrabold text-white"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.35 }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, delay: 0.7, repeat: 2, repeatDelay: 0.4 }}
              className="flex"
            >
              <HeartIcon className="h-3.5 w-3.5" />
            </motion.span>
            Matched {matchedLabel}
          </motion.span>
          )}
        </div>
      </motion.div>

      {/* Identity */}
      <motion.div variants={rise} className="mt-5">
        <h1 className="text-[34px] font-extrabold leading-none tracking-tight">
          {profile.name}
          <span className="font-semibold text-ink/45">, {profile.age}</span>
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-[15px] font-semibold text-ink/65">
          <PinIcon className="h-4 w-4 shrink-0" />
          {profile.location}
        </p>
      </motion.div>

      {/* About */}
      <motion.section variants={rise} className="mt-5">
        <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink/45">About</h2>
        <p className="text-[16px] font-medium leading-relaxed text-ink/85">{profile.bio}</p>
      </motion.section>

      <motion.div variants={rise}>
        <SideQuests profileId={profile.id} quests={profile.sideQuests} name={profile.name} />
      </motion.div>
    </motion.div>
  );
}
