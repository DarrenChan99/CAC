/** F11 — what reaches R6, and what the gentle filter held back. SPEC §10. */

export interface Feed {
  id: string;
  name: string;
  category: string;
  on: boolean;
  note: string;
}

export const feeds: Feed[] = [
  { id: "f1", name: "Local news", category: "Neighbourhood", on: true, note: "Your city + Pine Ridge area" },
  { id: "f2", name: "Gardening", category: "Hobby", on: true, note: "One of Grandma's favourites" },
  { id: "f3", name: "World headlines", category: "World", on: false, note: "Off — filtered for tone anyway" },
  { id: "f4", name: "Music & arts", category: "Culture", on: true, note: "Concerts, exhibitions" },
];

export const todayStories = [
  { source: "City Gazette", headline: "The city rose garden reopens this weekend" },
  { source: "Neighbourhood Post", headline: "The Tuesday market is moving to the square" },
  { source: "Arts Weekly", headline: "Free afternoon concerts return to the library" },
];

export const heldBack = [
  { source: "World Wire", headline: "Flooding displaces thousands overseas", reason: "distressing" },
  { source: "City Gazette", headline: "Fatal collision closes downtown bridge", reason: "distressing" },
  { source: "National Desk", headline: "Markets tumble on inflation report", reason: "distressing" },
];
