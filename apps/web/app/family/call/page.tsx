"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Camera, CameraOff, Check, Mic, MicOff, Pause, PhoneOff, Play, X } from "lucide-react";
import { PersonAvatar } from "@/components/PersonAvatar";
import { TranscriptBubble } from "@/components/TranscriptBubble";
import { useDemo } from "@/lib/demo-store";
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

const everyone = [...participantIds, ...remoteParticipantIds];
const candidates = everyone.map((id) => ({ id, name: get(id).name }));

/**
 * F3 Live call, family side. The named transcript, and what the call is
 * producing — none of it reaches Grandma until it is approved.
 */
export default function FamilyCall() {
  const router = useRouter();
  const { resolved, resolve, speakers, fixSpeaker } = useDemo();
  const { t, playing, activeSpeakerId, activeIsUnknown, bubbles, captured, toggle, seek } =
    useReplay();
  const threadRef = useRef<HTMLDivElement>(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

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
          Grandma Mei
        </span>
        <span className="font-mono text-f-label text-muted">{formatCallTime(t)}</span>

        <div className="flex -space-x-2">
          {everyone.map((id) => (
            <PersonAvatar
              key={id}
              initial={get(id).initial}
              size="small"
              className="ring-2 ring-[var(--color-bg)]"
            />
          ))}
        </div>

        {/* The call is scripted, and the transport says so quietly. */}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-tint px-2 py-1">
          <span className="pl-1 font-mono text-f-label uppercase text-muted">Demo call</span>
          <button
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-tint"
          >
            {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
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
          <div className="relative flex flex-1 items-center justify-center gap-6 overflow-hidden rounded-[12px] bg-[#2A3A30]">
            {["lisa", "emily", "ken"].map((id) => (
              <PersonAvatar
                key={id}
                initial={get(id).initial}
                size="family"
                className="!h-24 !w-24 !text-4xl opacity-30 blur-[2px]"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <CallButton label={mic ? "Mute" : "Unmute"} onClick={() => setMic((m) => !m)} off={!mic}>
              {mic ? <Mic size={20} aria-hidden /> : <MicOff size={20} aria-hidden />}
            </CallButton>
            <CallButton label={cam ? "Camera off" : "Camera on"} onClick={() => setCam((c) => !c)} off={!cam}>
              {cam ? <Camera size={20} aria-hidden /> : <CameraOff size={20} aria-hidden />}
            </CallButton>
            <CallButton label="Leave call" onClick={() => router.push("/family")} danger>
              <PhoneOff size={20} aria-hidden />
            </CallButton>
          </div>
        </section>

        {/* ---- Transcript ---- */}
        <section className="flex min-h-0 flex-col rounded-[12px] border border-tint bg-surface">
          <div className="border-b border-tint p-4 text-f-h3">Transcript</div>

          <div ref={threadRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {bubbles.map((b) => {
                const speakerId = b.id in speakers ? speakers[b.id] : b.speakerId;
                const person = speakerId ? get(speakerId) : null;
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
                    score={b.transcribing ? undefined : b.speakerScore}
                    candidates={candidates}
                    onReassign={(id) => fixSpeaker(b.id, id)}
                  />
                );
              })}
            </AnimatePresence>

            {/* Who is talking right now, mirrored from the resident view. */}
            {(activeSpeakerId || activeIsUnknown) && (
              <div className="pt-1 font-mono text-f-label uppercase text-muted">
                {activeIsUnknown ? "unknown voice" : get(activeSpeakerId!).name}
              </div>
            )}
          </div>
        </section>

        {/* ---- Captured ---- */}
        <section className="flex min-h-0 flex-col rounded-[12px] border border-tint bg-surface">
          <div className="border-b border-tint p-4 text-f-h3">Captured</div>

          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {captured.map((c) => {
                const state = resolved[c.id];
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: state === "rejected" ? 0.45 : 1, x: 0 }}
                    transition={spring}
                    className={`flex items-center gap-2 rounded-[12px] border p-3 ${
                      c.warn ? "border-[#EADFC4] bg-warn-bg" : "border-tint bg-bg"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
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
                    </div>
                    {state ? (
                      state === "approved" && <Check size={20} className="text-primary" aria-label="Approved" />
                    ) : (
                      <>
                        <MiniButton label={`Approve ${c.title}`} onClick={() => resolve(c.id, "approved")}>
                          <Check size={18} aria-hidden />
                        </MiniButton>
                        <MiniButton label={`Reject ${c.title}`} onClick={() => resolve(c.id, "rejected")}>
                          <X size={18} aria-hidden />
                        </MiniButton>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

function CallButton({
  label,
  onClick,
  off,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  off?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
        danger
          ? "border-transparent bg-[#7A2E22] text-white"
          : off
            ? "border-transparent bg-text text-white"
            : "border-tint bg-surface text-text hover:bg-tint"
      }`}
    >
      {children}
    </motion.button>
  );
}

function MiniButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-tint bg-surface text-primary transition-colors hover:bg-tint"
    >
      {children}
    </motion.button>
  );
}
