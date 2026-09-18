/**
 * Scripted call replay — the shape of SPEC §14 "Replay mode": a pre-recorded
 * call plays back through the real UI on the real event timeline, so the live
 * labelling can be demonstrated without a GPU service or a second person.
 *
 * Times are seconds into the call, so the on-screen timestamps ("2:14") are the
 * clock, not decoration.
 */

export interface CapturedItem {
  id: string;
  kind: "Memory" | "Med note" | "New person" | "Tree edit";
  title: string;
  warn?: boolean;
}

export interface Utterance {
  id: string;
  /** Seconds into the call when this person starts speaking. */
  at: number;
  /** How long the bubble shows transcribing dots before the text resolves. */
  speakFor: number;
  /** null means an unenrolled voice. It is never given a guessed name. */
  speakerId: string | null;
  text: string;
  /** ASR was not confident. Rendered with the warn treatment, never hidden. */
  lowConfidence?: boolean;
  /** The specific word we are unsure about. */
  uncertainWord?: string;
  /** Lands in the "Captured from this call" panel once the text resolves. */
  captured?: CapturedItem;
}

/**
 * The three sharing the living-room laptop. They hold a permanent card in the
 * resident's speaker strip.
 */
export const participantIds = ["lisa", "emily", "ken"];

/**
 * Anyone else on the call. They have no standing card — they take the strip's
 * guest slot while they are talking, which is the same slot an unenrolled voice
 * uses. Keeps the strip to four cards however many people dial in.
 */
export const remoteParticipantIds = ["david"];

export const CALL_START = 120; // 2:00
export const CALL_END = 175; // 2:55

export const timeline: Utterance[] = [
  {
    id: "u1",
    at: 124,
    speakFor: 3,
    speakerId: "lisa",
    text: "Mum, we're all here — Emily and Ken came over too.",
  },
  {
    id: "u2",
    at: 134,
    speakFor: 3,
    speakerId: "emily",
    text: "I passed my driving test on the first try, Grandma.",
    captured: { id: "c1", kind: "Memory", title: "Emily passed her driving test" },
  },
  {
    id: "u3",
    at: 151,
    speakFor: 3,
    speakerId: "david",
    text: "Make sure she takes the blood pressure pill at eight in the morning.",
    lowConfidence: true,
    uncertainWord: "eight",
    captured: { id: "c2", kind: "Med note", title: "Blood pressure pill at 8 am", warn: true },
  },
  {
    id: "u4",
    at: 158,
    speakFor: 2.5,
    speakerId: null,
    text: "Hi Mei, it's nice to finally meet you.",
    captured: { id: "c3", kind: "New person", title: "Marcus — Emily's boyfriend?" },
  },
  {
    id: "u5",
    at: 164,
    speakFor: 3,
    speakerId: "ken",
    text: "We'll call again on Sunday, Grandma. Look after yourself.",
  },
];

/** 134 → "2:14" */
export function formatCallTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
