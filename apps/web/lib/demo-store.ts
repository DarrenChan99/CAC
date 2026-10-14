"use client";

import { useSyncExternalStore } from "react";
import type { Resolved } from "./residentFeed.ts";

/**
 * The demo's shared state: which captured items the family removed or confirmed and which speaker
 * labels the family corrected. Kept in sessionStorage so a refresh mid-demo
 * doesn't lose it. ponytail: client-only; a backend replaces this module.
 */
interface State {
  resolved: Resolved;
  /** utteranceId → personId, or null for "Someone new". */
  speakers: Record<string, string | null>;
}

const KEY = "caretaker-demo-v2";
const EMPTY: State = { resolved: {}, speakers: {} };
let state = EMPTY;
let loaded = false;
const subs = new Set<() => void>();

function read() {
  if (!loaded) {
    loaded = true;
    try {
      state = JSON.parse(sessionStorage.getItem(KEY) ?? "") ?? EMPTY;
    } catch {}
  }
  return state;
}

function write(next: State) {
  state = next;
  sessionStorage.setItem(KEY, JSON.stringify(next));
  subs.forEach((f) => f());
}

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => void subs.delete(f);
};

export function useDemo() {
  const s = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    ...s,
    resolve: (id: string, how: "removed" | "confirmed") =>
      write({ ...state, resolved: { ...state.resolved, [id]: how } }),
    /** Undo a removal. */
    restore: (id: string) => {
      const rest = { ...state.resolved };
      delete rest[id];
      write({ ...state, resolved: rest });
    },
    fixSpeaker: (utteranceId: string, personId: string | null) =>
      write({ ...state, speakers: { ...state.speakers, [utteranceId]: personId } }),
    reset: () => write(EMPTY),
  };
}
