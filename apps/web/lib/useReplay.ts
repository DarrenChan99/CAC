"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CALL_END,
  CALL_START,
  timeline,
  type CapturedItem,
  type Utterance,
} from "./mocks/call-timeline";

export interface ReplayBubble extends Utterance {
  /** Still showing transcribing dots. */
  transcribing: boolean;
}

export interface ReplayState {
  /** Seconds into the call. */
  t: number;
  playing: boolean;
  /** null when nobody is talking; "unknown" when an unenrolled voice is. */
  activeSpeakerId: string | null;
  activeIsUnknown: boolean;
  /** Oldest first. The newest is the one the resident sees. */
  bubbles: ReplayBubble[];
  captured: CapturedItem[];
  toggle: () => void;
  seek: (seconds: number) => void;
  restart: () => void;
}

/**
 * One requestAnimationFrame clock driving both in-call screens. rAF rather than
 * setInterval so the timeline is display-synced and pauses with the tab.
 */
export function useReplay(autoplay = true): ReplayState {
  const [t, setT] = useState(CALL_START);
  const [playing, setPlaying] = useState(autoplay);
  const frame = useRef<number>(0);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();

    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((prev) => (prev + dt >= CALL_END ? CALL_START : prev + dt));
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const seek = useCallback((seconds: number) => setT(seconds), []);
  const restart = useCallback(() => setT(CALL_START), []);

  // Derived from t on every frame — no duplicated state to fall out of sync.
  const started = timeline.filter((u) => t >= u.at);
  const bubbles: ReplayBubble[] = started.map((u) => ({
    ...u,
    transcribing: t < u.at + u.speakFor,
  }));

  const speaking = started.find((u) => t < u.at + u.speakFor);
  const captured = started
    .filter((u) => u.captured && t >= u.at + u.speakFor)
    .map((u) => u.captured!);

  return {
    t,
    playing,
    activeSpeakerId: speaking ? speaking.speakerId : null,
    activeIsUnknown: Boolean(speaking && speaking.speakerId === null),
    bubbles,
    captured,
    toggle,
    seek,
    restart,
  };
}
