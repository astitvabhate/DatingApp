"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CURRENT_USER, type Match } from "@/lib/types";
import { HeartIcon } from "./icons";

type Props = { match: Match | null; onClose: () => void };

export default function MatchModal({ match, onClose }: Props) {
  return (
    <AnimatePresence>
      {match && (
        <motion.div
          key={match.profile.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby="match-title"
          className="absolute inset-0 z-50 flex items-center justify-center bg-ink/40 px-5 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="chunky-lg w-full max-w-sm rounded-[28px] bg-white p-4"
            initial={{ y: 40, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
          >
            {/* Two avatars meeting */}
            <div className="relative h-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.img
                  src={CURRENT_USER.photo}
                  alt="You"
                  className="h-24 w-24 rounded-full border-2 border-ink bg-white object-cover"
                  initial={{ x: -90, opacity: 0, rotate: -12 }}
                  animate={{ x: 10, opacity: 1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
                />
                <motion.img
                  src={match.profile.photo}
                  alt={match.profile.name}
                  className="h-24 w-24 rounded-full border-2 border-ink bg-white object-cover"
                  initial={{ x: 90, opacity: 0, rotate: 12 }}
                  animate={{ x: -10, opacity: 1, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
                />
                <motion.div
                  className="absolute flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-brand text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.45, duration: 0.45 }}
                >
                  <HeartIcon className="h-5 w-5" />
                </motion.div>
              </div>
            </div>

            <div className="px-2 pb-1 pt-5">
              <motion.h2
                id="match-title"
                className="text-[34px] font-extrabold leading-[1.05] tracking-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                It&apos;s a match<span className="text-brand">!</span>
              </motion.h2>
              <p className="mt-2 text-[15px] font-semibold text-ink/75">
                You and {match.profile.name} liked each other. Likes stay secret unless they&apos;re mutual — and this one is.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/discover/matches"
                  className="chunky press rounded-full bg-brand py-3.5 text-center text-[17px] font-bold text-ink"
                >
                  View matches
                </Link>
                <button
                  onClick={onClose}
                  autoFocus
                  className="chunky press rounded-full bg-white py-3.5 text-[17px] font-bold text-ink"
                >
                  Keep swiping
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
