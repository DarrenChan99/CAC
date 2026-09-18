"use client";

import { motion } from "motion/react";
import { PersonAvatar } from "./PersonAvatar";
import { spring } from "@/lib/motion";

interface SpeakerCardProps {
  name: string;
  relationship: string;
  initial: string;
  talking?: boolean;
  unknown?: boolean;
}

/**
 * Resident speaker card. The active state is the only animation in the resident
 * view, and it is never colour-only: the card grows, takes a green border and a
 * breathing ring, *and* says "Talking now" in words.
 *
 * The unknown card never guesses a name and never shows a photo.
 */
export function SpeakerCard({
  name,
  relationship,
  initial,
  talking = false,
  unknown = false,
}: SpeakerCardProps) {
  return (
    <motion.div
      animate={{ scale: talking ? 1.04 : 1 }}
      transition={spring}
      className={`flex flex-1 items-center gap-5 rounded-[16px] p-5 ${
        unknown
          ? "border-2 border-dashed border-muted bg-surface"
          : talking
            ? "border-[3px] border-primary bg-surface"
            : "border border-tint bg-surface"
      }`}
    >
      <div className={talking && !unknown ? "ct-pulse rounded-full" : ""}>
        <PersonAvatar initial={initial} size="resident" unknown={unknown} />
      </div>

      <div className="min-w-0">
        <div className="text-r-h2 truncate">{unknown ? "Someone new" : name}</div>
        <div className="text-r-body text-muted">
          {unknown ? "a voice we don't know" : relationship}
        </div>

        {talking && (
          <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-tint px-4 py-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
            <span className="text-r-body font-bold text-primary">Talking now</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
