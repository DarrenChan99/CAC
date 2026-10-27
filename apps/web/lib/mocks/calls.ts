/** Call history for Home. Only Sunday has a kept transcript (the scripted `timeline`). */

export interface CallRecord {
  id: string;
  /** Short label in the list: a weekday this week, a date before that. */
  label: string;
  long: string;
  durationSec: number;
  participantIds: string[];
  capturedIds: string[];
  hasTranscript: boolean;
}

export const calls: CallRecord[] = [
  {
    id: "sunday",
    label: "Sunday",
    long: "Sunday, Oct 11",
    durationSec: 612,
    participantIds: ["lisa", "emily", "david", "kevin"],
    capturedIds: ["a4", "a1", "a2", "a3"],
    hasTranscript: true,
  },
  {
    id: "thursday",
    label: "Thursday",
    long: "Thursday, Oct 8",
    durationSec: 760,
    participantIds: ["lisa", "david"],
    capturedIds: [],
    hasTranscript: false,
  },
  {
    id: "oct-4",
    label: "Oct 4",
    long: "Sunday, Oct 4",
    durationSec: 1865,
    participantIds: ["lisa", "kevin", "karen"],
    capturedIds: [],
    hasTranscript: false,
  },
];

export const getCall = (id: string) => calls.find((c) => c.id === id);

/** 612 → "10 min" */
export const minutes = (sec: number) => `${Math.max(1, Math.round(sec / 60))} min`;
