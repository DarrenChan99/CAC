"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Camera, CameraOff, Mic, MicOff, NotebookPen, Pause, PhoneOff, Play } from "lucide-react";
import { CapturedChip, ICON, STATUS } from "@/components/CapturedRow";
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
import { spring, springQuick } from "@/lib/motion";

const everyone = [...participantIds, ...remoteParticipantIds];
const candidates = everyone.map((id) => ({ id, name: get(id).name }));

/**
 * F3 Live call, family side. The call is a silent notetaker: it names who is
 * speaking and notes what it picks up. Nothing is asked of you until afterwards.
 */
export default function FamilyCall() {
  const router = useRouter();
  const { speakers, fixSpeaker } = useDemo();
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
      {/* Floating chrome: the call bar sits over the content rather than
          carving a strip out of it. */}
      <header
        className="sticky top-0 z-10 flex items-center gap-4 border-b border-tint px-6 py-2.5"
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
        <span className="text-f-small tabular-nums text-muted">{formatCallTime(t)}</span>

        <div className="ml-auto flex items-center gap-3">
          <CapturedPill items={captured} />

          {/* The call is scripted, and the transport says so quietly. */}
          <div className="flex items-center gap-1 rounded-full border border-tint py-0.5 pl-3 pr-2">
            <span className="text-f-label text-muted">Replay</span>
            <button
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-tint"
            >
              {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
            </button>
            <input
              type="range"
              min={CALL_START}
              max={CALL_END}
              step={0.1}
              value={t}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Scrub the call"
              className="w-28 accent-[var(--color-primary)]"
            />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[1fr_380px]">
        {/* ---- Stage ---- */}
        <section className="relative flex min-h-0 flex-col overflow-hidden rounded-[12px] bg-stage">
          <div className="grid flex-1 grid-cols-2 content-center gap-3 p-3 pb-24">
            {everyone.map((id) => {
              const talking = id === activeSpeakerId;
              return (
                <div
                  key={id}
                  className={`relative flex aspect-video items-center justify-center rounded-[12px] bg-white/[0.06] transition-shadow duration-300 ${
                    talking ? "shadow-[0_0_0_3px_var(--color-accent)]" : ""
                  }`}
                >
                  <PersonAvatar initial={get(id).initial} size="family" className="!h-20 !w-20 !text-3xl" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-0.5 text-f-small text-white">
                    {get(id).name}
                  </span>
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {activeIsUnknown && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: springQuick }}
                transition={spring}
                className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-f-small text-white"
              >
                Unknown voice
              </motion.span>
            )}
          </AnimatePresence>

          <div
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 p-1.5"
            style={{ backdropFilter: "var(--ct-chrome-blur)", WebkitBackdropFilter: "var(--ct-chrome-blur)" }}
          >
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
          <div className="border-b border-tint px-4 py-3 text-f-h3">Transcript</div>

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
                    meta={`${person ? `${relationship(person.id)} · ` : "· "}${formatCallTime(b.at)}`}
                    text={b.text}
                    transcribing={b.transcribing}
                    lowConfidence={b.lowConfidence}
                    uncertainWord={b.uncertainWord}
                    unknown={!person}
                    candidates={candidates}
                    onReassign={(id) => fixSpeaker(b.id, id)}
                  >
                    {!b.transcribing && b.captured && <CapturedChip item={b.captured} />}
                  </TranscriptBubble>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

/** "3 captured" — opens a read-only list. Nothing to approve mid-call. */
function CapturedPill({ items }: { items: ReturnType<typeof useReplay>["captured"] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[44px] items-center gap-2 rounded-full border border-tint bg-surface px-4 text-f-small font-medium text-primary transition-colors hover:bg-tint"
      >
        <NotebookPen size={16} aria-hidden />
        <span className="tabular-nums">{items.length}</span> captured
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: springQuick }}
            transition={springQuick}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-full z-20 mt-2 w-[340px] rounded-[12px] border border-tint bg-surface p-2 shadow-lg"
          >
            {items.length === 0 ? (
              <p className="px-3 py-4 text-f-small text-muted">Nothing yet. It listens quietly.</p>
            ) : (
              items.map((c) => {
                const Icon = ICON[c.kind];
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-[8px] px-3 py-2">
                    <Icon size={16} aria-hidden className={`flex-none ${c.warn ? "text-warn" : "text-primary"}`} />
                    <span className="min-w-0 flex-1 truncate text-f-small">{c.title}</span>
                    <span className="flex-none text-f-label text-muted">{STATUS[c.kind]}</span>
                  </div>
                );
              })
            )}
            <Link
              href="/family/approvals"
              className="mt-1 flex min-h-[44px] items-center justify-between border-t border-tint px-3 text-f-small text-primary hover:underline"
            >
              Review after the call <span aria-hidden>→</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
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
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
        danger
          ? "bg-danger text-white"
          : off
            ? "bg-white text-text"
            : "bg-white/15 text-white hover:bg-white/25"
      }`}
    >
      {children}
    </motion.button>
  );
}
