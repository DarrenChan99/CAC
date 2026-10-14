"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/Button";
import { PersonAvatar } from "@/components/PersonAvatar";
import { ResidentNavButton } from "@/components/ResidentHeader";
import { SpeakerCard } from "@/components/SpeakerCard";
import { useDemo } from "@/lib/demo-store";
import { participantIds, formatCallTime } from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { relationshipToResident } from "@/lib/relationships";
import { useReplay } from "@/lib/useReplay";
import { spring, springSheet } from "@/lib/motion";

/**
 * R3 In call. Video on top, a large card per enrolled participant below, and
 * the newest line of the conversation in type she can read from a chair.
 * The full thread is collapsed by default and opens on request.
 */
export default function ResidentCall() {
  const router = useRouter();
  const { activeSpeakerId, activeIsUnknown, bubbles } = useReplay();
  const { speakers } = useDemo();
  const [expanded, setExpanded] = useState(false);

  const newest = bubbles[bubbles.length - 1];
  const newestSpeakerId = newest ? (newest.id in speakers ? speakers[newest.id] : newest.speakerId) : null;
  const newestSpeaker = newestSpeakerId ? get(newestSpeakerId) : null;

  // Whoever is talking but has no standing card.
  const guest = activeIsUnknown
    ? { name: "", initial: "?", relationship: "", unknown: true }
    : activeSpeakerId && !participantIds.includes(activeSpeakerId)
      ? {
          name: get(activeSpeakerId).name,
          initial: get(activeSpeakerId).initial,
          relationship: relationshipToResident(activeSpeakerId),
          unknown: false,
        }
      : null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-[1180px] flex-col gap-6 p-8">
      {/* ---- Video ---- */}
      <div className="relative flex min-h-0 flex-[3] gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex items-center justify-center rounded-[16px] ${
              i === 1 ? "flex-[1.6] bg-[#334339]" : "flex-1 bg-[#2A3A30]"
            }`}
          >
            <PersonAvatar
              initial={get(participantIds[i]).initial}
              size="resident"
              className="opacity-30 blur-[2px]"
            />
          </div>
        ))}

        <div className="absolute right-4 top-4">
          <ResidentNavButton href="/resident" label="Home" />
        </div>
      </div>

      {/* ---- Speaker strip ---- */}
      <div className="flex flex-none gap-4">
        {participantIds.map((id) => {
          const person = get(id);
          return (
            <SpeakerCard
              key={id}
              name={person.name}
              initial={person.initial}
              relationship={relationshipToResident(id)}
              talking={activeSpeakerId === id}
            />
          );
        })}

        {/* The guest slot. Someone dialling in from elsewhere gets their real
            name here; an unenrolled voice gets "Someone new" and no name at
            all. Either way the strip stays four cards wide. */}
        <AnimatePresence>
          {guest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={spring}
              className="flex flex-1"
            >
              <SpeakerCard
                name={guest.name}
                initial={guest.initial}
                relationship={guest.relationship}
                unknown={guest.unknown}
                talking
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Newest line + actions ---- */}
      <div className="flex flex-none items-center gap-6 rounded-[16px] border border-tint bg-surface p-6">
        <div className="min-w-0 flex-1 text-r-lead">
          {newest ? (
            <>
              <span className="font-bold text-primary">
                {newestSpeaker ? newestSpeaker.name : "Someone new"}
              </span>{" "}
              {newest.transcribing ? "…" : newest.text}
            </>
          ) : (
            <span className="text-muted">Nobody is talking.</span>
          )}
        </div>

        <Button scale="resident" variant="secondary" onClick={() => setExpanded(true)}>
          Show conversation
        </Button>
        <Button
          scale="resident"
          variant="primary"
          className="!bg-[#7A2E22]"
          onClick={() => router.push("/resident")}
        >
          End call
        </Button>
      </div>

      {/* ---- Full thread ----
          Enters from the bottom and leaves the same way, so it stays obvious
          where it went. */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10 bg-black/25"
              onClick={() => setExpanded(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={springSheet}
              className="fixed inset-x-0 bottom-0 z-20 max-h-[72dvh] overflow-y-auto rounded-t-[24px] bg-surface p-10"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-r-h1">Your conversation</h2>
                <Button scale="resident" variant="secondary" onClick={() => setExpanded(false)}>
                  Close
                </Button>
              </div>

              <div className="flex flex-col gap-6">
                {bubbles.map((b) => {
                  const sid = b.id in speakers ? speakers[b.id] : b.speakerId;
                  const person = sid ? get(sid) : null;
                  return (
                    <div key={b.id} className="flex items-start gap-5">
                      <PersonAvatar
                        initial={person?.initial ?? "?"}
                        size="resident"
                        unknown={!person}
                        className="!h-16 !w-16 !text-2xl"
                      />
                      <div>
                        <div className="text-r-body text-muted">
                          {person ? person.name : "Someone new"} ·{" "}
                          {formatCallTime(b.at)}
                        </div>
                        <div className="text-r-lead">
                          {b.transcribing ? "…" : b.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
