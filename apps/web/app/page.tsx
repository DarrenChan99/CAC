"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/Button";
import { spring } from "@/lib/motion";

const VIEWS = {
  resident: {
    label: "See what Grandma sees",
    blurb:
      "An iPad on a stand. Big type, four things to do, and the name of whoever is talking — on screen, in words, while they talk.",
    screens: [
      { href: "/resident", name: "Home", id: "R1" },
      { href: "/resident/incoming", name: "Incoming call", id: "R2" },
      { href: "/resident/call", name: "In call", id: "R3" },
      { href: "/resident/family", name: "My family", id: "R4" },
      { href: "/resident/family/emily", name: "Person page", id: "R5" },
      { href: "/resident/news", name: "Family news", id: "R6" },
      { href: "/resident/today", name: "Today", id: "R7" },
    ],
  },
  family: {
    label: "What the family sees",
    blurb:
      "The other side of the same call: a named transcript, what the conversation produced, and an approval queue that stands between it and her screen.",
    screens: [
      { href: "/family", name: "Dashboard", id: "F1" },
      { href: "/family/call", name: "In call", id: "F3" },
      { href: "/family/approvals", name: "Approval queue", id: "F5" },
      { href: "/family/enroll", name: "Voice enrollment", id: "F8" },
    ],
  },
} as const;

type ViewKey = keyof typeof VIEWS;

export default function Landing() {
  const [view, setView] = useState<ViewKey>("resident");
  const current = VIEWS[view];

  return (
    <div className="min-h-dvh bg-bg font-family-view text-text">
      <div className="mx-auto max-w-[900px] px-6 py-20">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-7 w-7 rounded-[9px] bg-primary" aria-hidden />
          <span className="text-f-h3 tracking-tight">Caretaker</span>
        </div>

        <h1 className="max-w-[18ch] text-[clamp(2rem,6vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em]">
          Family calls that say who is speaking.
        </h1>

        <p className="mt-5 max-w-[56ch] text-f-h3 font-normal text-muted">
          When four people crowd around one laptop, a voice is just a voice. Caretaker
          names each one on screen while they talk, and turns what they said into a family
          tree her family keeps.
        </p>

        {/* Two-view switcher. The same call, from both ends. */}
        <div className="mt-10 inline-flex gap-1 rounded-[14px] border border-tint bg-surface p-1">
          {(Object.keys(VIEWS) as ViewKey[]).map((key) => {
            const on = key === view;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`relative min-h-[44px] rounded-[10px] px-4 text-f-small transition-colors ${
                  on ? "text-white" : "text-muted hover:text-text"
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="view-switch"
                    transition={spring}
                    className="absolute inset-0 -z-10 rounded-[10px] bg-primary"
                  />
                )}
                {VIEWS[key].label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={spring}
            className="mt-6"
          >
            <p className="max-w-[60ch] text-f-body text-muted">{current.blurb}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link href={current.screens[0].href}>
                <Button variant="primary">Try the demo</Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {current.screens.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex min-h-[44px] items-center gap-3 rounded-[12px] border border-tint bg-surface px-4 py-3 transition-colors hover:border-primary"
                >
                  <span className="font-mono text-f-label text-muted">{s.id}</span>
                  <span className="text-f-body">{s.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="mt-16 max-w-[60ch] border-t border-tint pt-6 text-f-small text-muted">
          Voiceprints are stored as mathematical templates, never as recordings, and only
          with each person&apos;s consent. Audio retention is off by default and any
          voiceprint can be deleted at any time. Everything captured from a call waits for
          a family member&apos;s approval before it reaches the resident&apos;s screen.
        </p>

        <p className="mt-4 font-mono text-f-label uppercase text-muted">
          Demo family · fictional data · UI preview, no live services
        </p>
      </div>
    </div>
  );
}
