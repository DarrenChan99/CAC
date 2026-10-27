"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  CALL_END,
  CALL_START,
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
  /** Start playback. Call it from a tap: browsers only allow sound from a user gesture. */
  play: () => void;
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

  // A file that is missing or won't decode drops to the scripted clock, so the
  // transcript still runs (silently) instead of refusing to play.
  const failed = useRef(false);
  // With a recording the video is the clock (so labels stay locked to the audio);
  // without one, the rAF delta is.
  const video = () => (failed.current ? null : videoRef.current);

  const start = (v: HTMLVideoElement) => {
    if (v.currentTime + mediaOffset < CALL_START) v.currentTime = CALL_START - mediaOffset;
    v.play().catch((e: DOMException) => {
      if (e.name === "AbortError") return; // a pause() beat it; state already says paused
      if (e.name === "NotAllowedError") return setPlaying(false); // needs a tap first
      failed.current = true;
    });
  };

  useEffect(() => {
    if (!playing) {
      video()?.pause();
      return;
    }
    // Autoplay on mount. A tap has already started it inside the gesture (play()).
    const v = video();
    if (v?.paused) start(v);
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

  // play() runs inside the click handler, not in the effect: Safari (and the
  // resident iPad) only grants audio to play() called from the gesture itself.
  const play = () => {
    const v = video();
    if (v?.paused) start(v);
    setPlaying(true);
  };
  const toggle = () => (playing ? setPlaying(false) : play());
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
    play,
    seek,
    restart,
    videoRef,
  };
}
