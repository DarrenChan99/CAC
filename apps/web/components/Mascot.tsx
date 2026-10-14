"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { spring } from "@/lib/motion";

type View = "family" | "resident";

const COPY = {
  family: { text: "Want to see what Grandma sees?", href: "/resident/incoming", tile: "Grandma's iPad" },
  resident: { text: "Back to the family view", href: "/family", tile: "Family view" },
} as const;

/**
 * The 家 tile, popping out of the corner once per session per view to point at
 * the other side of the call. In the resident view it collapses to a labelled
 * 72px tile afterwards — the permanent way back, and the only thing that stays.
 */
export function Mascot({ view }: { view: View }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"hidden" | "bubble" | "tile">("hidden");
  const key = `caretaker-mascot-${view}`;
  const copy = COPY[view];

  useEffect(() => {
    const seen = sessionStorage.getItem(key) !== null;
    if (seen && view === "family") return;
    const t = setTimeout(() => setPhase(seen ? "tile" : "bubble"), seen ? 0 : 1200);
    return () => clearTimeout(t);
  }, [key, view]);

  function dismiss() {
    sessionStorage.setItem(key, "1");
    setPhase(view === "resident" ? "tile" : "hidden");
  }

  // The incoming-call screen owns the whole display.
  if (pathname === "/resident/incoming") return null;

  const resident = view === "resident";
  const enter = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.2 };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3">
      <AnimatePresence>
        {phase === "bubble" && (
          <motion.div
            key="bubble"
            initial={enter}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={spring}
            style={{ transformOrigin: "bottom right" }}
            className="pointer-events-auto flex items-center gap-3 rounded-[16px] border border-tint bg-surface p-3 shadow-lg"
          >
            <Image src="/tile.png" alt="" width={resident ? 64 : 40} height={resident ? 73 : 46} />
            <Link
              href={copy.href}
              className={`font-semibold text-primary ${
                resident ? "flex min-h-[72px] items-center px-2 text-r-body" : "text-f-body"
              }`}
            >
              {copy.text}
            </Link>
            <button
              onClick={dismiss}
              aria-label="Close"
              className={`flex items-center justify-center rounded-[12px] text-muted ${
                resident ? "min-h-[72px] min-w-[72px]" : "min-h-[44px] min-w-[44px]"
              }`}
            >
              <X size={resident ? 32 : 20} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "tile" && (
        <Link
          href={copy.href}
          className="pointer-events-auto flex min-h-[72px] items-center gap-3 rounded-[16px] border border-tint bg-surface px-5 text-r-body font-bold text-primary shadow-lg"
        >
          <Image src="/tile.png" alt="" width={36} height={41} />
          {copy.tile}
        </Link>
      )}
    </div>
  );
}
