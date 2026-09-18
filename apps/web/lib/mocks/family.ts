/** The Chen family — the demo family from SPEC §14. Never real family data. */

export type Gender = "f" | "m";

export interface Person {
  id: string;
  name: string;
  /** Shown in the avatar circle when there is no photo. */
  initial: string;
  gender: Gender;
  /** Biological parents, used to derive relationships. */
  parentIds?: string[];
  /** Married to this person. */
  spouseOf?: string;
  /** Sibling of this person. */
  siblingOf?: string;
  isResident?: boolean;
  deceased?: boolean;
  voiceEnrolled?: boolean;
  /** Has an account, so the resident can call them. */
  callable?: boolean;
}

export const RESIDENT_ID = "mei";

export const family: Person[] = [
  { id: "mei", name: "Mei", initial: "M", gender: "f", isResident: true },
  { id: "wei", name: "Wei", initial: "W", gender: "m", spouseOf: "mei", deceased: true },
  { id: "ling", name: "Ling", initial: "L", gender: "f", siblingOf: "mei", callable: true },

  // Children
  { id: "lisa", name: "Lisa", initial: "L", gender: "f", parentIds: ["mei", "wei"], voiceEnrolled: true, callable: true },
  { id: "david", name: "David", initial: "D", gender: "m", parentIds: ["mei", "wei"], voiceEnrolled: true, callable: true },
  { id: "karen", name: "Karen", initial: "K", gender: "f", spouseOf: "david", callable: true },

  // Grandchildren
  { id: "emily", name: "Emily", initial: "E", gender: "f", parentIds: ["lisa"], voiceEnrolled: true, callable: true },
  { id: "ken", name: "Ken", initial: "K", gender: "m", parentIds: ["lisa"], voiceEnrolled: true, callable: true },
  { id: "jason", name: "Jason", initial: "J", gender: "m", parentIds: ["david", "karen"], callable: true },
  { id: "sophie", name: "Sophie", initial: "S", gender: "f", parentIds: ["david", "karen"], callable: true },

  // Great-grandchild. Currently filed under Emily; approval item #3 moves her to Jason.
  { id: "ava", name: "Ava", initial: "A", gender: "f", parentIds: ["emily"] },
];

export const byId = (id: string): Person | undefined => family.find((p) => p.id === id);

export const get = (id: string): Person => {
  const p = byId(id);
  if (!p) throw new Error(`Unknown person: ${id}`);
  return p;
};
