"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  CALL_END,
  CALL_START,
  media,
  mediaOffset,
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
  /** Attach to the <video> that carries the recording; the clock then follows it. */
  videoRef: RefObject<HTMLVideoElement | null>;
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // With a recording the video is the clock (so labels stay locked to the audio);
  // without one, the rAF delta is.
  const video = () => (media ? videoRef.current : null);

  useEffect(() => {
    if (!playing) {
      video()?.pause();
      return;
    }
    const v = video();
    if (v) {
      if (v.currentTime + mediaOffset < CALL_START) v.currentTime = CALL_START - mediaOffset;
      // Browsers can refuse unmuted autoplay before a click; fall back to paused.
      v.play().catch(() => setPlaying(false));
    }
    last.current = performance.now();

    const tick = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      const vv = video();
      setT((prev) => {
        const next = vv ? vv.currentTime + mediaOffset : prev + dt;
        if (next < CALL_END) return next;
        if (vv) vv.currentTime = CALL_START - mediaOffset;
        return CALL_START;
      });
      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const seek = useCallback((seconds: number) => {
    setT(seconds);
    const v = video();
    if (v) v.currentTime = Math.max(0, seconds - mediaOffset);
  }, []);
  const restart = useCallback(() => seek(CALL_START), [seek]);

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
    videoRef,
  };
}
