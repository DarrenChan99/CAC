/** Seeded content for the demo family — SPEC §14. */

export interface Memory {
  id: string;
  personId: string;
  text: string;
  when: string;
  hasPhoto?: boolean;
}

export const memories: Memory[] = [
  { id: "m2", personId: "emily", text: "Emily started her new job at the library", when: "February", hasPhoto: true },
  { id: "m3", personId: "emily", text: "Emily brought you peonies", when: "January", hasPhoto: true },
  { id: "m4", personId: "ken", text: "Ken is learning to make dumplings from your recipe", when: "February", hasPhoto: true },
  { id: "m5", personId: "ken", text: "Ken moved into a flat near the park", when: "January" },
  { id: "m6", personId: "lisa", text: "Lisa repainted the front door green", when: "March", hasPhoto: true },
  { id: "m7", personId: "lisa", text: "Lisa is growing tomatoes on the balcony", when: "February" },
  { id: "m8", personId: "david", text: "David's team won their Sunday league match", when: "March" },
  { id: "m9", personId: "sophie", text: "Sophie is playing the cello in the school concert", when: "March", hasPhoto: true },
  { id: "m10", personId: "jason", text: "Jason took Ava to the aquarium", when: "February", hasPhoto: true },
  { id: "m11", personId: "ava", text: "Ava said her first full sentence", when: "January" },
  { id: "m12", personId: "karen", text: "Karen finished her quilt for the church sale", when: "January", hasPhoto: true },
  { id: "m13", personId: "ling", text: "Ling called from Taipei on your birthday", when: "December" },
  { id: "m14", personId: "emily", text: "Emily read you the whole first chapter", when: "December" },
  { id: "m15", personId: "lisa", text: "Lisa brought the photo album from the old house", when: "December", hasPhoto: true },
];

export const memoriesFor = (personId: string) => memories.filter((m) => m.personId === personId);

export interface NewsItem {
  id: string;
  category: string;
  when: string;
  headline: string;
  body: string;
  readTime: string;
}

export const news: NewsItem[] = [
  {
    id: "n1",
    category: "Gardening",
    when: "this morning",
    headline: "The city rose garden reopens this weekend",
    body: "After two years of work, the old glasshouse is open again. Volunteers have planted four hundred roses along the main path.",
    readTime: "2 min read",
  },
  {
    id: "n2",
    category: "Your neighbourhood",
    when: "yesterday",
    headline: "The Tuesday market is moving to the square",
    body: "Stalls will set up by the fountain from next week. The flower seller and the bakery are both making the move.",
    readTime: "1 min read",
  },
  {
    id: "n3",
    category: "Music",
    when: "two days ago",
    headline: "Free afternoon concerts return to the library",
    body: "A string quartet will play every second Thursday at two o'clock. Tea is served afterwards in the reading room.",
    readTime: "2 min read",
  },
  {
    id: "n4",
    category: "Science",
    when: "this week",
    headline: "Swallows have arrived three weeks early",
    body: "Birdwatchers along the river have counted more swallows than in any spring since records began.",
    readTime: "3 min read",
  },
];

export interface DayEvent {
  id: string;
  time: string;
  part: string;
  title: string;
  note: string;
}

export const events: DayEvent[] = [
  { id: "e1", time: "2:00", part: "afternoon", title: "Lisa visits", note: "She is bringing Emily" },
  { id: "e2", time: "5:30", part: "afternoon", title: "Dinner in the dining room", note: "Fish and rice today" },
];

/** F1 dashboard — Grandma's week. */
export const weekStats = [
  { label: "Calls this week", value: "5", note: "2 more than last week" },
  { label: "Time together", value: "94 min", note: "longest: Sunday, 31 min" },
  { label: "Memories captured", value: "7", note: "3 waiting for approval" },
  { label: "People on calls", value: "6", note: "4 voices enrolled" },
];

/** Who spoke, and for how long. */
export const weekSpeakers = [
  { personId: "lisa", minutes: 38, share: 0.4 },
  { personId: "emily", minutes: 27, share: 0.29 },
  { personId: "ken", minutes: 17, share: 0.18 },
  { personId: "david", minutes: 12, share: 0.13 },
];
