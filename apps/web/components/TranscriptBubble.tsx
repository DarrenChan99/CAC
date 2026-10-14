"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Wrench } from "lucide-react";
import { PersonAvatar } from "./PersonAvatar";
import { spring, springQuick } from "@/lib/motion";

interface TranscriptBubbleProps {
  name: string;
  meta: string;
  initial: string;
  text: string;
  transcribing?: boolean;
  lowConfidence?: boolean;
  uncertainWord?: string;
  unknown?: boolean;
  /** Rendered under the line, e.g. a CapturedChip. */
  children?: React.ReactNode;
  /** Who this line can be reassigned to. null in onReassign means "Someone new". */
  candidates?: { id: string; name: string }[];
  onReassign?: (personId: string | null) => void;
}

/** Three dots while the words are still arriving. */
function TranscribingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-2" aria-label="transcribing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="ct-dot h-2 w-2 rounded-full bg-muted"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

/** Renders the uncertain word with the warn treatment, in place. */
function withUncertainty(text: string, word?: string) {
  if (!word) return text;
  const parts = text.split(word);
  if (parts.length < 2) return text;
  return (
    <>
      {parts[0]}
      <span className="rounded bg-warn-bg px-1 font-semibold text-warn">{word}</span>
      {parts.slice(1).join(word)}
    </>
  );
}

export function TranscriptBubble({
  name,
  meta,
  initial,
  text,
  transcribing = false,
  lowConfidence = false,
  uncertainWord,
  unknown = false,
  children,
  candidates = [],
  onReassign,
}: TranscriptBubbleProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="group flex gap-3"
    >
      <PersonAvatar initial={initial} size="small" unknown={unknown} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <motion.span
            key={unknown ? "?" : name}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="text-f-body font-semibold"
          >
            {unknown ? "Unknown speaker" : name}
          </motion.span>
          <span className="text-f-label font-medium tabular-nums text-muted">{meta}</span>
          {onReassign && (
            <span className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Fix speaker"
                title="Fix speaker"
                className={`flex h-8 w-8 items-center justify-center rounded-[10px] text-muted transition-opacity hover:bg-tint focus-visible:opacity-100 group-hover:opacity-100 ${
                  unknown || open ? "opacity-100" : "opacity-0"
                }`}
              >
                <Wrench size={16} aria-hidden />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: springQuick }}
                    transition={springQuick}
                    style={{ transformOrigin: "top left" }}
                    className="absolute left-0 top-9 z-20 flex w-44 flex-col rounded-[12px] border border-tint bg-surface p-1 shadow-lg"
                  >
                    {candidates.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onReassign(c.id);
                          setOpen(false);
                        }}
                        className="min-h-[36px] rounded-[8px] px-3 text-left text-f-small hover:bg-tint"
                      >
                        {c.name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onReassign(null);
                        setOpen(false);
                      }}
                      className="min-h-[36px] rounded-[8px] border-t border-tint px-3 text-left text-f-small text-muted hover:bg-tint"
                    >
                      Someone new
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </span>
          )}
        </div>

        <div
          className={`rounded-[12px] px-3 py-2 text-f-body ${
            lowConfidence ? "bg-warn-bg text-warn" : "bg-bg text-text"
          }`}
        >
          {transcribing ? <TranscribingDots /> : withUncertainty(text, uncertainWord)}
        </div>

        {lowConfidence && !transcribing && (
          <div className="mt-1.5 flex items-center gap-1.5 text-f-small text-warn">
            <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden />
            Not sure we heard this right
          </div>
        )}

        {children}
      </div>
    </motion.div>
  );
}
