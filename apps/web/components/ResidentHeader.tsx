"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { pressResident, pressTransition } from "@/lib/motion";

/**
 * Every resident screen answers "where am I" and "how do I get out". The way
 * out is a real 72px target with the word Home on it, in the same place every
 * time — predictability is the whole point.
 */
export function ResidentHeader({
  title,
  note,
  back,
}: {
  title: string;
  note?: string;
  /** An extra way back, e.g. "Back to family" on a person page. */
  back?: { href: string; label: string };
}) {
  return (
    <header className="flex items-start gap-8 pb-8">
      <div className="min-w-0 flex-1">
        <h1 className="text-r-h1">{title}</h1>
        {note && <p className="mt-2 text-r-lead text-muted">{note}</p>}
      </div>

      <div className="flex flex-none gap-6">
        {back && <ResidentNavButton href={back.href} label={back.label} />}
        <ResidentNavButton href="/resident" label="Home" />
      </div>
    </header>
  );
}

export function ResidentNavButton({ href, label }: { href: string; label: string }) {
  return (
    <motion.div whileTap={pressResident} transition={pressTransition}>
      <Link
        href={href}
        className="flex min-h-[72px] items-center rounded-[16px] bg-tint px-7 text-r-body font-bold text-primary"
      >
        {label}
      </Link>
    </motion.div>
  );
}
