"use client";

// "Side quests" Pinterest-style masonry on profile pages (4–6 pins), balanced into two columns.
// Photos come from the photo album (public/images/album/women), excluding the
// person's own profile photo and rotated per profile so everyone gets a
// different mix. Falls back to Lorem Picsum if the album is empty.

import { motion } from "framer-motion";
import album from "@/lib/album.generated.json";

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
const ALBUM: string[] = album.women as string[];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Album photos for this profile: skips their own photo, starts at a per-profile offset. */
function questPhotos(profileId: string, ownPhoto: string, count: number): (string | null)[] {
  const pool = ALBUM.filter((src) => src !== ownPhoto);
  if (!pool.length) return Array(count).fill(null);
  const start = hash(profileId) % pool.length;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
}

const picsum = (profileId: string, quest: string, w: number, h: number) =>
  `https://picsum.photos/seed/${profileId}-${slug(quest)}/${w * 2}/${h * 2}`;

type Props = { profileId: string; profilePhoto: string; quests: string[]; name: string };

export default function SideQuests({ profileId, profilePhoto, quests, name }: Props) {
  const list = quests.slice(0, 6);
  const photos = questPhotos(profileId, profilePhoto, list.length);

  // Greedy balance by relative height (h / w), keeping original order within each column.
  const columns: { quest: string; i: number }[][] = [[], []];
  const heights = [0, 0];
  list.forEach((quest, i) => {
    const { w, h } = SHAPES[i % SHAPES.length];
    const c = heights[0] <= heights[1] ? 0 : 1;
    columns[c].push({ quest, i });
    heights[c] += h / w;
  });

  return (
    <section className="mt-6">
      <h2 className="mb-0.5 text-[20px] font-extrabold tracking-tight">Side quests</h2>
      <p className="mb-3 text-sm font-semibold text-ink/55">Things {name} is always up for</p>
      {/* Two balanced columns: each pin goes to the shorter column, and the last pin
          of each column grows so both columns end level (no empty gap). */}
      <div className="grid grid-cols-2 gap-2.5 pb-1 pr-1">
        {columns.map((col, c) => (
          <ul key={c} className="flex flex-col gap-3">
            {col.map(({ quest, i }, j) => {
              const { w, h } = SHAPES[i % SHAPES.length];
              const last = j === col.length - 1;
              return (
                <motion.li
                  key={quest}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.4 + i * 0.07 }}
                  whileTap={{ scale: 0.97 }}
                  title={quest}
                  style={{ aspectRatio: `${w} / ${h}` }}
                  className={`chunky-sm relative overflow-hidden rounded-2xl ${last ? "grow" : ""} ${TONES[i % TONES.length]}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos[i] ?? picsum(profileId, quest, w, h)}
                    alt={`${name}'s side quest: ${quest}`}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </motion.li>
              );
            })}
          </ul>
        ))}
      </div>
    </section>
  );
}
