"use client";

// "Side quests" Pinterest-style masonry on profile pages (4–6 pins).
// Placeholder photos come from Lorem Picsum, seeded per profile + quest so each
// person's grid is stable across visits. Swap `questPhoto` for real
// user-uploaded photos in a later phase.

import { motion } from "framer-motion";

// Varied pin shapes (width x height). The order keeps the two columns roughly balanced.
const SHAPES = [
  { w: 300, h: 400 }, // tall
  { w: 300, h: 300 }, // square
  { w: 300, h: 225 }, // landscape
  { w: 300, h: 375 }, // portrait
  { w: 300, h: 300 }, // square
  { w: 300, h: 420 }, // tall
];

const TONES = ["bg-lilac", "bg-peach", "bg-blush"];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const questPhoto = (profileId: string, quest: string, w: number, h: number) =>
  `https://picsum.photos/seed/${profileId}-${slug(quest)}/${w * 2}/${h * 2}`;

type Props = { profileId: string; quests: string[]; name: string };

export default function SideQuests({ profileId, quests, name }: Props) {
  return (
    <section className="mt-6">
      <h2 className="mb-0.5 text-[20px] font-extrabold tracking-tight">Side quests</h2>
      <p className="mb-3 text-sm font-semibold text-ink/55">Things {name} is always up for</p>
      <ul className="columns-2 gap-2.5 pr-1">
        {quests.slice(0, 6).map((quest, i) => {
          const { w, h } = SHAPES[i % SHAPES.length];
          return (
            <motion.li
              key={quest}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.4 + i * 0.07 }}
              whileTap={{ scale: 0.97 }}
              title={quest}
              className={`chunky-sm mb-3 break-inside-avoid overflow-hidden rounded-2xl ${TONES[i % TONES.length]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={questPhoto(profileId, quest, w, h)}
                alt={`${name}'s side quest: ${quest}`}
                loading="lazy"
                draggable={false}
                style={{ aspectRatio: `${w} / ${h}` }}
                className="block w-full object-cover"
              />
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
