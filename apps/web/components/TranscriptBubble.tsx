"use client";

import { motion } from "motion/react";
import { PersonAvatar } from "./PersonAvatar";
import { spring } from "@/lib/motion";

interface TranscriptBubbleProps {
  name: string;
  meta: string;
  initial: string;
  text: string;
  transcribing?: boolean;
  lowConfidence?: boolean;
  uncertainWord?: string;
  unknown?: boolean;
  onIdentify?: () => void;
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
  onIdentify,
}: TranscriptBubbleProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="flex gap-3"
    >
      <PersonAvatar initial={initial} size="small" unknown={unknown} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-f-body font-semibold">
            {unknown ? "Unknown speaker" : name}
          </span>
          <span className="font-mono text-f-label text-muted">{meta}</span>
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

        {unknown && !transcribing && onIdentify && (
          <button
            onClick={onIdentify}
            className="mt-2 min-h-[44px] rounded-[12px] border border-tint px-3 text-f-small text-primary transition-colors hover:bg-tint"
          >
            Who is this?
          </button>
        )}
      </div>
    </motion.div>
  );
}
