/** F11 — what reaches R6, and what the gentle filter held back. SPEC §10. */

import type { TopicId } from "./content.ts";

/** One row per topic on her news rail ("From your family" is always on). */
export const feedNotes: Partial<Record<TopicId, string>> = {
  neighbourhood: "Your city + Pine Ridge area",
  garden: "One of Grandma's favourites",
  music: "Concerts and the radio",
  science: "Birds, rivers, the night sky",
  sport: "Local clubs and the city team",
};

export const heldBack = [
  { source: "World Wire", headline: "Flooding displaces thousands overseas", reason: "distressing" },
  { source: "City Gazette", headline: "Fatal collision closes downtown bridge", reason: "distressing" },
  { source: "National Desk", headline: "Markets tumble on inflation report", reason: "distressing" },
];
