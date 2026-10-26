"use client";

import { useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/Button";
import { CallVideo } from "@/components/CallVideo";
import { PersonAvatar } from "@/components/PersonAvatar";
import { ResidentNavButton } from "@/components/ResidentHeader";
import { useDemo } from "@/lib/demo-store";
import { cameraId, formatCallTime, media, participantIds } from "@/lib/mocks/call-timeline";
import { get } from "@/lib/mocks/family";
import { relationshipToResident } from "@/lib/relationships";
import { activeSpeaker } from "@/lib/residentFeed";
import { useReplay } from "@/lib/useReplay";
import { spring, springSheet } from "@/lib/motion";

/**
 * R3 In call. Everyone on a video tile with their name on it; whoever is
 * talking gets the ring and the words "Talking now". One line of what was just
 * said, and three big buttons. The full thread opens on request.
 */
export default function ResidentCall() {
  const router = useRouter();
  const { bubbles, videoRef } = useReplay();
  const { speakers } = useDemo();
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);

  const newest = bubbles[bubbles.length - 1];
  const newestSpeakerId = newest ? (newest.id in speakers ? speakers[newest.id] : newest.speakerId) : null;
  const newestSpeaker = newestSpeakerId ? get(newestSpeakerId) : null;

  // Someone dialling in from elsewhere, or a voice we don't know, takes the
  // fourth tile while they talk. An unknown voice is never given a name.
  const talking = activeSpeaker(bubbles, speakers);
  const guest = talking && !participantIds.includes(talking) ? talking : null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-[1180px] flex-col gap-6 p-8">
      {/* ---- Video ---- */}
      <div
        className={`relative grid min-h-0 flex-1 gap-4 ${participantIds.length <= 2 ? "grid-cols-3 grid-rows-1" : "grid-cols-2 grid-rows-2"}`}
      >
        {participantIds.map((id) => (
          <VideoTile key={id} id={id} talking={talking === id} video={media && id === cameraId ? videoRef : undefined} />
        ))}

        <AnimatePresence>
          {guest && (
            <motion.div
              key={guest}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={spring}
              className="flex"
            >
              <VideoTile id={guest === "unknown" ? null : guest} talking />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute right-4 top-4">
          <ResidentNavButton href="/resident" label="Home" />
        </div>

        {/* Her own camera, small, so she knows she is on screen. */}
        <div className="absolute bottom-4 right-4 flex h-[120px] w-[180px] items-end rounded-[12px] border-2 border-surface bg-stage p-2">
          <span className="rounded-full bg-black/60 px-3 text-r-body text-white">You</span>
        </div>
      </div>

      {/* ---- Newest line ---- */}
      <div className="flex-none truncate rounded-[16px] border border-tint bg-surface px-6 py-4 text-r-lead">
        {newest ? (
          <>
            <span className="font-bold text-primary">{newestSpeaker ? newestSpeaker.name : "Someone new"}</span>{" "}
            {newest.transcribing ? "…" : newest.text}
          </>
        ) : (
          <span className="text-muted">Nobody is talking.</span>
        )}
      </div>

      {/* ---- Actions ---- */}
      <div className="flex flex-none gap-6">
        <Button
          scale="resident"
          variant={muted ? "warn" : "secondary"}
          aria-pressed={muted}
          onClick={() => setMuted((m) => !m)}
          className="min-w-[280px]"
        >
          {muted ? "You are muted" : "Mute"}
        </Button>
        <Button scale="resident" variant="secondary" onClick={() => setExpanded(true)} className="flex-1">
          Show conversation
        </Button>
        <Button scale="resident" variant="danger" onClick={() => router.push("/resident")} className="min-w-[280px]">
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

/** A video tile. The video itself is a placeholder until LiveKit lands. */
function VideoTile({
  id,
  talking,
  video,
}: {
  id: string | null;
  talking: boolean;
  video?: RefObject<HTMLVideoElement | null>;
}) {
  const person = id ? get(id) : null;

  return (
    <div
      className={`relative flex flex-1 items-center justify-center rounded-[16px] bg-stage pb-14 ${
        person ? (talking ? "ct-pulse" : "") : "border-4 border-dashed border-surface/70"
      }`}
    >
      {video ? (
        <CallVideo videoRef={video} />
      ) : (
        <PersonAvatar initial={person?.initial ?? "?"} size="resident" unknown={!person} className="opacity-40" />
      )}

      {talking && (
        <span className="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-surface px-4 py-1 text-r-body font-bold text-primary">
          <span className="h-3 w-3 rounded-full bg-primary" aria-hidden />
          Talking now
        </span>
      )}

      <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] truncate rounded-[12px] bg-black/60 px-4 py-1 text-r-body text-white">
        <b>{person ? person.name : "Someone new"}</b> · {person ? relationshipToResident(person.id) : "a voice we don't know"}
      </span>
    </div>
  );
}
