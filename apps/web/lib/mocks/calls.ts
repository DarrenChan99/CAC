/** Call history — SPEC §5.2 F4/F4b. Floor segments are the single source for
 * every timeline: the calls-list mini bar and the call-detail "who held the
 * floor" bar both read from the same `segments` array. */

export interface FloorSegment {
  speakerId: string;
  /** Seconds from call start. */
  startMs: number;
  endMs: number;
}

export interface TranscriptLine {
  id: string;
  atMs: number;
  speakerId: string | null;
  text: string;
  lowConfidence?: boolean;
}

export interface Correction {
  atMs: number;
  fromSpeakerId: string;
  toSpeakerId: string;
  proposedBy: string;
  status: "proposed" | "confirmed" | "rejected";
}

export interface CallItem {
  id: string;
  when: string;
  period: "This week" | "Last week";
  day: string;
  time: string;
  title: string;
  participants: string;
  durationMin: number | null;
  missed?: boolean;
  segments: FloorSegment[];
  floorNote?: string;
  tags: string[];
  transcript?: TranscriptLine[];
  correction?: Correction;
  capturedCount?: number;
}

/** Stable speaker colours — SPEC §"Speaker palette". Never reassigned by
 * order of speaking. */
export const speakerColor: Record<string, string> = {
  mei: "#1E5B3C",
  david: "#2A6647",
  lisa: "#3F7F5E",
  ken: "#6FA08A",
  emily: "#9DBF97",
  unknown: "#B9C4B5",
};

export const calls: CallItem[] = [
  {
    id: "call-sun",
    when: "Sunday 2:14 pm",
    period: "This week",
    day: "Sun",
    time: "2:14 pm",
    title: "Group call — living room laptop",
    participants: "Grandma Mei, Lisa, Ken, Emily, David + 1 unknown",
    durationMin: 31,
    tags: ["3 memories", "1 med note"],
    floorNote: "Lisa held the floor longest",
    segments: [
      { speakerId: "lisa", startMs: 0, endMs: 620 },
      { speakerId: "emily", startMs: 620, endMs: 900 },
      { speakerId: "david", startMs: 900, endMs: 1100 },
      { speakerId: "unknown", startMs: 1100, endMs: 1180 },
      { speakerId: "ken", startMs: 1180, endMs: 1860 },
    ],
    capturedCount: 5,
    transcript: [
      {
        id: "t1",
        atMs: 134,
        speakerId: "lisa",
        text: "Mum, we're all here — Emily and Ken came over too.",
      },
      {
        id: "t2",
        atMs: 214,
        speakerId: "ken",
        text: "Make sure she takes the blood pressure pill at eight in the morning.",
        lowConfidence: true,
      },
      {
        id: "t3",
        atMs: 364,
        speakerId: "emily",
        text: "I passed my driving test on the first try, Grandma.",
      },
      {
        id: "t4",
        atMs: 458,
        speakerId: null,
        text: "Hi Mei, it's nice to finally meet you.",
      },
    ],
    correction: {
      atMs: 364,
      fromSpeakerId: "ken",
      toSpeakerId: "david",
      proposedBy: "Ken",
      status: "proposed",
    },
  },
  {
    id: "call-wed",
    when: "Wednesday 6:40 pm",
    period: "This week",
    day: "Wed",
    time: "6:40 pm",
    title: "One-to-one call",
    participants: "Grandma Mei, Ken",
    durationMin: 12,
    tags: ["1 memory"],
    floorNote: "Ken held the floor",
    segments: [{ speakerId: "ken", startMs: 0, endMs: 720 }],
  },
  {
    id: "call-missed",
    when: "Monday 4:05 pm",
    period: "This week",
    day: "Mon",
    time: "4:05 pm",
    title: "Missed call",
    participants: "David",
    durationMin: null,
    missed: true,
    tags: ["Missed"],
    segments: [],
  },
  {
    id: "call-lastsun",
    when: "Last Sunday 3:00 pm",
    period: "Last week",
    day: "Sun",
    time: "3:00 pm",
    title: "Group call — phone, speaker on",
    participants: "Grandma Mei, David, Karen, Sophie",
    durationMin: 22,
    tags: ["2 memories", "1 tree edit"],
    floorNote: "David held the floor longest",
    segments: [
      { speakerId: "david", startMs: 0, endMs: 800 },
      { speakerId: "unknown", startMs: 800, endMs: 900 },
      { speakerId: "ken", startMs: 900, endMs: 1320 },
    ],
  },
];

export const byId = (id: string) => calls.find((c) => c.id === id);
