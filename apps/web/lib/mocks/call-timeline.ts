/**
 * Scripted call replay — the shape of SPEC §14 "Replay mode": a pre-recorded
 * call plays back through the real UI on the real event timeline, so the live
 * labelling can be demonstrated without a GPU service or a second person.
 *
 * Times are seconds into the call, so the on-screen timestamps ("2:14") are the
 * clock, not decoration.
 */

import call from "./replay/demo-call.json" with { type: "json" };

export interface CapturedItem {
  id: string;
  kind: "Memory" | "Med note" | "New person" | "Tree edit";
  title: string;
  warn?: boolean;
}

/**
 * One diarized utterance. This is the contract the diarization service emits:
 * who spoke (or null for an unenrolled voice), when, what was said, and how
 * close the voice matched the enrolled voiceprint. `useReplay` is the only
 * place that produces these — a live source replaces its internals, not this.
 */
export interface Utterance {
  id: string;
  /** Seconds into the call when this person starts speaking. */
  at: number;
  /** How long the bubble shows transcribing dots before the text resolves. */
  speakFor: number;
  /** null means an unenrolled voice. It is never given a guessed name. */
  speakerId: string | null;
  /** Cosine match (0–1) against the enrolled voiceprint. Low when speakerId is null. */
  speakerScore: number;
  text: string;
  /** ASR was not confident. Rendered with the warn treatment, never hidden. */
  lowConfidence?: boolean;
  /** The specific word we are unsure about. */
  uncertainWord?: string;
  /** Lands in the "Captured" panel once the text resolves. `id` is the approval id. */
  captured?: CapturedItem;
}

/**
 * Who is on the call, from the replay file (`python -m caretaker_speaker.replay`
 * maps each enrolled voice to the family persona set in demo.config.json). The
 * resident's speaker strip gives each a permanent card.
 */
export const participantIds: string[] = call.participants;

/**
 * Anyone else on the call. They have no standing card — they take the strip's
 * guest slot while they are talking, which is the same slot an unenrolled voice
 * uses. Keeps the strip to four cards however many people dial in.
 */
export const remoteParticipantIds: string[] = (call as { remote?: string[] }).remote ?? [];

/** The recording played in the camera person's tile; null = no media, a scripted clock. */
export const media: string | null = call.media;
/** Call-clock seconds at media time 0. */
export const mediaOffset: number = call.offset;
/** Persona on webcam. Everyone else's camera is off. */
export const cameraId: string | null = call.cameraId;

/**
 * Who/when/what comes from the diarization backend (replay/sunday.json, written
 * by `python -m caretaker_speaker.replay`). What the family's notetaker captured
 * from each line is authored here, keyed by utterance id — the backend does not
 * extract memories yet.
 */
const overlay: Record<string, Pick<Utterance, "captured" | "uncertainWord">> = {
  u2: { captured: { id: "a4", kind: "Memory", title: "David passed his driving test" } },
  u3: {
    uncertainWord: "eight",
    captured: { id: "a1", kind: "Med note", title: "Blood pressure pill at 8 am", warn: true },
  },
  u4: { captured: { id: "a2", kind: "New person", title: "Anna — David's aunt?" } },
};

export const timeline: Utterance[] = (call.utterances as Utterance[]).map((u) => ({
  ...u,
  ...overlay[u.id],
}));

export const CALL_START = timeline.length ? Math.floor(Math.min(...timeline.map((u) => u.at))) : 0;
export const CALL_END = timeline.length
  ? Math.ceil(Math.max(...timeline.map((u) => u.at + u.speakFor))) + 2
  : 0;

/** 134 → "2:14" */
export function formatCallTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
