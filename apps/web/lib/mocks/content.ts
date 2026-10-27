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
  { id: "m4", personId: "david", text: "David is learning to make dumplings from your recipe", when: "February", hasPhoto: true },
  { id: "m5", personId: "david", text: "David moved into a flat near the park", when: "January" },
  { id: "m6", personId: "lisa", text: "Lisa repainted the front door green", when: "March", hasPhoto: true },
  { id: "m7", personId: "lisa", text: "Lisa is growing tomatoes on the balcony", when: "February" },
  { id: "m8", personId: "kevin", text: "Kevin's team won their Sunday league match", when: "March" },
  { id: "m9", personId: "sophie", text: "Sophie is playing the cello in the school concert", when: "March", hasPhoto: true },
  { id: "m10", personId: "jason", text: "Jason took Ava to the aquarium", when: "February", hasPhoto: true },
  { id: "m11", personId: "ava", text: "Ava said her first full sentence", when: "January" },
  { id: "m12", personId: "karen", text: "Karen finished her quilt for the church sale", when: "January", hasPhoto: true },
  { id: "m13", personId: "ling", text: "Ling called from Taipei on your birthday", when: "December" },
  { id: "m14", personId: "emily", text: "Emily read you the whole first chapter", when: "December" },
  { id: "m15", personId: "lisa", text: "Lisa brought the photo album from the old house", when: "December", hasPhoto: true },
];

export const memoriesFor = (personId: string) => memories.filter((m) => m.personId === personId);

export const TOPICS = [
  { id: "family", label: "From your family" },
  { id: "neighbourhood", label: "Your neighbourhood" },
  { id: "garden", label: "Gardening" },
  { id: "music", label: "Music" },
  { id: "science", label: "Nature and science" },
  { id: "sport", label: "Sport" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export const topicLabel = (id: TopicId) => TOPICS.find((t) => t.id === id)!.label;

export interface NewsItem {
  id: string;
  topic: TopicId;
  when: string;
  headline: string;
  /** Paragraphs are separated by a blank line. */
  body: string;
}

export const news: NewsItem[] = [
  {
    id: "n1",
    topic: "garden",
    when: "this morning",
    headline: "The city rose garden reopens this weekend",
    body: "After two years of work, the old glasshouse is open again. Volunteers have planted four hundred roses along the main path.\n\nThe gardeners kept cuttings from the original beds, so some of the roses are older than the glasshouse itself. Entry is free on Saturday morning.",
  },
  {
    id: "n5",
    topic: "garden",
    when: "yesterday",
    headline: "Now is the time to plant sweet peas",
    body: "Sweet peas sown this month will flower by early summer. Soak the seeds overnight and plant them two fingers deep.\n\nThey like something to climb. A few garden canes tied at the top are enough.",
  },
  {
    id: "n6",
    topic: "garden",
    when: "this week",
    headline: "A ninety-year-old pear tree gives its first fruit in a decade",
    body: "The pear tree behind the old school had not fruited for ten years. This autumn a neighbour counted thirty pears.\n\nA local gardener had been pruning it gently every winter. He says old trees only need patience.",
  },
  {
    id: "n7",
    topic: "garden",
    when: "last week",
    headline: "The allotments are giving away spare seedlings",
    body: "Tomato, basil and marigold seedlings are free to take from the table by the allotment gate.\n\nThe growers ask only that you bring back a cutting or a story of how they did.",
  },
  {
    id: "n2",
    topic: "neighbourhood",
    when: "yesterday",
    headline: "The Tuesday market is moving to the square",
    body: "Stalls will set up by the fountain from next week. The flower seller and the bakery are both making the move.\n\nThere will be benches in the shade, and the bakery promises its sesame buns on the first day.",
  },
  {
    id: "n8",
    topic: "neighbourhood",
    when: "this morning",
    headline: "The library is opening on Sunday afternoons",
    body: "From next month the library will open from one until four on Sundays.\n\nThe large-print shelf has been moved to the ground floor, next to the window seats.",
  },
  {
    id: "n9",
    topic: "neighbourhood",
    when: "two days ago",
    headline: "New benches along the river path",
    body: "Six new wooden benches have been placed along the river path, one every few minutes' walk.\n\nEach one has a small plaque with the name of a tree you can see from it.",
  },
  {
    id: "n10",
    topic: "neighbourhood",
    when: "this week",
    headline: "Pine Ridge choir is looking for new voices",
    body: "The Pine Ridge choir meets on Wednesday mornings in the community hall. No experience is needed.\n\nThey are learning old folk songs this season, and tea is served at the break.",
  },
  {
    id: "n3",
    topic: "music",
    when: "two days ago",
    headline: "Free afternoon concerts return to the library",
    body: "A string quartet will play every second Thursday at two o'clock. Tea is served afterwards in the reading room.\n\nThe first programme includes Dvořák and a set of Chinese folk melodies arranged for strings.",
  },
  {
    id: "n11",
    topic: "music",
    when: "yesterday",
    headline: "A young pianist wins the city competition",
    body: "A fourteen-year-old from the east side won the city piano competition with a Chopin nocturne.\n\nShe says she learned on her grandmother's old upright piano.",
  },
  {
    id: "n12",
    topic: "music",
    when: "this week",
    headline: "The radio is playing a week of love songs from the 1960s",
    body: "Every afternoon this week the classic station is playing love songs from the 1960s.\n\nListeners can phone in to ask for a favourite and say who it is for.",
  },
  {
    id: "n13",
    topic: "music",
    when: "last week",
    headline: "The brass band plays in the park on Saturday",
    body: "The town brass band will play in the park bandstand on Saturday at eleven.\n\nChairs are put out for anyone who would like to sit.",
  },
  {
    id: "n4",
    topic: "science",
    when: "this week",
    headline: "Swallows have arrived three weeks early",
    body: "Birdwatchers along the river have counted more swallows than in any spring since records began.\n\nThe warm weather in the south meant the birds set off sooner. They are building nests under the bridge again.",
  },
  {
    id: "n14",
    topic: "science",
    when: "yesterday",
    headline: "A family of otters is back in the river",
    body: "For the first time in thirty years, otters have been seen in the river near the old mill.\n\nThe water has become much cleaner, and the otters have followed the fish.",
  },
  {
    id: "n15",
    topic: "science",
    when: "two days ago",
    headline: "The full moon on Friday will look larger than usual",
    body: "Friday's full moon is close to the earth and will look bright and large as it rises.\n\nThe best time to look is just after sunset, low in the east.",
  },
  {
    id: "n16",
    topic: "science",
    when: "last week",
    headline: "Honeybees can recognise faces, scientists find",
    body: "Researchers found that honeybees can learn to tell one face from another.\n\nThey remembered the faces for two days afterwards.",
  },
  {
    id: "n17",
    topic: "sport",
    when: "this morning",
    headline: "The table tennis club celebrates fifty years",
    body: "The community table tennis club opened fifty years ago this month. Some members have played there since the start.\n\nAnyone is welcome to watch the anniversary games on Saturday.",
  },
  {
    id: "n18",
    topic: "sport",
    when: "yesterday",
    headline: "The city team wins at home",
    body: "The city team won two goals to one in front of a full stadium.\n\nThe winning goal came in the last minute of the match.",
  },
  {
    id: "n19",
    topic: "sport",
    when: "this week",
    headline: "A morning tai chi group starts in the park",
    body: "A free tai chi group meets by the pond at eight every weekday morning.\n\nThe teacher says the slow movements suit every age.",
  },
  {
    id: "n20",
    topic: "sport",
    when: "last week",
    headline: "The swimming pool adds a quiet session",
    body: "The pool now has a quiet session every Thursday morning, with no music and the lanes kept wide.\n\nThe water is kept a little warmer for it.",
  },
];

export interface Photo {
  id: string;
  personIds: string[];
  /** Follows the names, e.g. "at his graduation". */
  caption: string;
  when: string;
}

export const photos: Photo[] = [
  { id: "p1", personIds: ["david"], caption: "at his graduation", when: "last May" },
  { id: "p2", personIds: ["emily"], caption: "at her new desk in the library", when: "February" },
  { id: "p3", personIds: ["lisa"], caption: "by the green front door", when: "March" },
  { id: "p4", personIds: ["sophie"], caption: "with her cello before the concert", when: "March" },
  { id: "p5", personIds: ["jason", "ava"], caption: "at the aquarium", when: "February" },
  { id: "p6", personIds: ["karen"], caption: "with the finished quilt", when: "January" },
  { id: "p7", personIds: ["kevin", "karen"], caption: "at their wedding anniversary dinner", when: "last autumn" },
  { id: "p8", personIds: ["wei"], caption: "in the garden of the old house", when: "many years ago" },
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
