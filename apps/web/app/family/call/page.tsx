"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { TranscriptBubble } from "@/components/TranscriptBubble";
import { Button } from "@/components/Button";
import {
  CALL_END,
  CALL_START,
  formatCallTime,
  participantIds,
  remoteParticipantIds,
} from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { relationship } from "@/lib/relationships";
import { useReplay } from "@/lib/useReplay";
import { spring } from "@/lib/motion";

/**
 * F3 In call, family side. The full named transcript, and a live panel of what
 * the call is producing — none of which reaches Grandma until it is approved.
 */
export default function FamilyCall() {
  const router = useRouter();
  const { t, playing, activeSpeakerId, activeIsUnknown, bubbles, captured, toggle, seek } =
    useReplay();
  const threadRef = useRef<HTMLDivElement>(null);

  // Follow the conversation, the way a chat does.
  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [bubbles.length]);

  return (
    <div className="flex h-dvh flex-col">
      {/* Floating chrome: the call header sits over the content rather than
          carving a strip out of it. */}
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-tint px-6 py-3"
        style={{
          background: "var(--ct-chrome-bg)",
          backdropFilter: "var(--ct-chrome-blur)",
          WebkitBackdropFilter: "var(--ct-chrome-blur)",
        }}
      >
        <span className="flex items-center gap-2 text-f-body font-semibold">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          Live with Grandma Mei
        </span>
        <span className="font-mono text-f-label text-muted">{formatCallTime(t)}</span>

        <span className="ml-4 text-f-small text-muted">On this call</span>
        <div className="flex -space-x-2">
          {[...participantIds, ...remoteParticipantIds].map((id) => (
            <PersonAvatar
              key={id}
              initial={get(id).initial}
              size="small"
              className="ring-2 ring-[var(--color-bg)]"
            />
          ))}
        </div>

        {/* Replay transport — this is a scripted call, and the UI says so
            rather than pretending to be live. */}
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-f-label uppercase text-muted">replay</span>
          <button
            onClick={toggle}
            className="min-h-[44px] rounded-[12px] border border-tint px-3 text-f-small text-primary transition-colors hover:bg-tint"
          >
            {playing ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={CALL_START}
            max={CALL_END}
            step={0.1}
            value={t}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Scrub the call"
            className="w-40 accent-[var(--color-primary)]"
          />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[1.1fr_1fr_0.8fr]">
        {/* ---- Video ---- */}
        <section className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-1 items-center justify-center rounded-[12px] bg-[#2A3A30] text-f-small text-white/45">
            grandma&apos;s feed
          </div>
          <div className="text-f-small text-muted">
            Living room laptop · Lisa, Emily, Ken
          </div>
          <div className="flex gap-2">
            <Button variant="quiet">Mute</Button>
            <Button variant="quiet">Camera</Button>
            <Button variant="quiet" onClick={() => router.push("/family")}>
              Leave call
            </Button>
          </div>
        </section>

        {/* ---- Transcript ---- */}
        <section className="flex min-h-0 flex-col rounded-[12px] border border-tint bg-surface">
          <div className="border-b border-tint p-4">
            <div className="text-f-h3">Transcript</div>
            <div className="text-f-small text-muted">
              Grandma sees the newest line, large
            </div>
            <button className="mt-2 min-h-[44px] rounded-[12px] border border-tint px-3 text-f-small text-primary transition-colors hover:bg-tint">
              Wrong speaker? Fix it
            </button>
          </div>

          <div ref={threadRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {bubbles.map((b) => {
                const person = b.speakerId ? get(b.speakerId) : null;
                return (
                  <TranscriptBubble
                    key={b.id}
                    name={person?.name ?? ""}
                    initial={person?.initial ?? "?"}
                    meta={
                      person
                        ? `${relationship(person.id)} · ${formatCallTime(b.at)}`
                        : `· ${formatCallTime(b.at)}`
                    }
                    text={b.text}
                    transcribing={b.transcribing}
                    lowConfidence={b.lowConfidence}
                    uncertainWord={b.uncertainWord}
                    unknown={!person}
                    onIdentify={() => router.push("/family/approvals")}
                  />
                );
              })}
            </AnimatePresence>

            {/* Who is talking right now, mirrored from the resident view. */}
            {(activeSpeakerId || activeIsUnknown) && (
              <div className="pt-1 font-mono text-f-label uppercase text-muted">
                {activeIsUnknown
                  ? "unknown voice speaking"
                  : `${get(activeSpeakerId!).name} speaking`}
              </div>
            )}
          </div>
        </section>

        {/* ---- Captured ---- */}
        <section className="flex min-h-0 flex-col rounded-[12px] border border-tint bg-surface">
          <div className="border-b border-tint p-4">
            <div className="text-f-h3">Captured from this call</div>
            <div className="text-f-small text-muted">
              Nothing is saved or shown to Grandma until a family member approves it.
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {captured.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={spring}
                  className={`rounded-[12px] border p-3 ${
                    c.warn ? "border-[#EADFC4] bg-warn-bg" : "border-tint bg-bg"
                  }`}
                >
                  <div
                    className={`font-mono text-f-label uppercase ${
                      c.warn ? "text-warn" : "text-muted"
                    }`}
                  >
                    {c.kind}
                  </div>
                  <div className={`text-f-body ${c.warn ? "text-warn" : "text-text"}`}>
                    {c.title}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {captured.length === 0 && (
              <div className="text-f-small text-muted">Nothing captured yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
