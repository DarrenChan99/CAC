"use client";

import { motion } from "motion/react";

type Size = "resident" | "family" | "small";

const sizes: Record<Size, { box: string; type: string }> = {
  resident: { box: "h-[120px] w-[120px]", type: "text-[44px]" },
  family: { box: "h-14 w-14", type: "text-xl" },
  small: { box: "h-9 w-9", type: "text-sm" },
};

interface PersonAvatarProps {
  initial: string;
  /** Who this is. Avatars show the initial. */
  personId?: string;
  size?: Size;
  /** Unknown voices get a dashed neutral treatment and a "?" — never a name. */
  unknown?: boolean;
  deceased?: boolean;
  /** Shared-element id, so a face can grow into a portrait across screens. */
  layoutId?: string;
  className?: string;
}

export function PersonAvatar({
  initial,
  size = "family",
  unknown = false,
  deceased = false,
  layoutId,
  className = "",
}: PersonAvatarProps) {
  const s = sizes[size];

  return (
    <motion.div
      layoutId={layoutId}
      className={`${s.box} ${s.type} flex flex-none items-center justify-center overflow-hidden rounded-full font-bold ${
        unknown
          ? "border-2 border-dashed border-muted bg-surface text-muted"
          : deceased
            ? "bg-tint text-primary opacity-60"
            : "bg-tint text-primary"
      } ${className}`}
    >
      {unknown ? "?" : initial}
    </motion.div>
  );
}

/** The relationship chip that sits under a face. Always derived, never stored. */
export function RelationshipChip({
  label,
  scale = "family",
}: {
  label: string;
  scale?: "resident" | "family";
}) {
  return (
    <span
      className={
        scale === "resident"
          ? "rounded-full bg-tint px-4 py-1 text-r-body text-primary"
          : "rounded-full bg-tint px-2.5 py-0.5 text-f-small text-primary"
      }
    >
      {label}
    </span>
  );
}
