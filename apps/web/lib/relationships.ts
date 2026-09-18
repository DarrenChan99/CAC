import { byId, get, RESIDENT_ID, type Person } from "./mocks/family.ts";

/**
 * Relationships are always rendered from the resident's point of view
 * ("your grandson"), and always derived — never stored as a string. Storing
 * them is how a tree ends up saying "granddaughter" about someone who was
 * re-parented last week.
 */

const DESCENDANT = [
  ["daughter", "son"],
  ["granddaughter", "grandson"],
  ["great-granddaughter", "great-grandson"],
] as const;

/** Generations between the resident and a descendant; -1 if not a descendant. */
function descendantDepth(person: Person, depth = 1): number {
  if (depth > 6) return -1;
  for (const parentId of person.parentIds ?? []) {
    if (parentId === RESIDENT_ID) return depth;
    const parent = byId(parentId);
    if (!parent) continue;
    const found = descendantDepth(parent, depth + 1);
    if (found !== -1) return found;
  }
  return -1;
}

/** The bare noun: "granddaughter", "sister", "Emily's partner". */
export function relationship(personId: string): string {
  const person = get(personId);
  if (person.isResident) return "this is you";

  const depth = descendantDepth(person);
  if (depth > 0 && depth <= DESCENDANT.length) {
    return DESCENDANT[depth - 1][person.gender === "f" ? 0 : 1];
  }

  if (person.siblingOf) {
    const sibling = get(person.siblingOf);
    const noun = person.gender === "f" ? "sister" : "brother";
    return sibling.isResident ? noun : `${sibling.name}'s ${noun}`;
  }

  if (person.spouseOf) {
    const spouse = get(person.spouseOf);
    const noun = person.gender === "f" ? "wife" : "husband";
    return spouse.isResident ? noun : `${spouse.name}'s ${noun}`;
  }

  return "family";
}

/** How the resident view addresses them: "your granddaughter". */
export function relationshipToResident(personId: string): string {
  const person = get(personId);
  if (person.isResident) return "this is you";
  if (person.deceased && person.spouseOf === RESIDENT_ID) return "remembered";

  const label = relationship(personId);
  // Only possessive-prefix the labels that are actually hers to own.
  return /^(daughter|son|grand|great-|sister|brother|wife|husband)/.test(label)
    ? `your ${label}`
    : label;
}

/** 0 = resident's generation, 1 = children, 2 = grandchildren, 3 = great-grandchildren. */
export function generation(personId: string): number {
  const person = get(personId);
  if (person.isResident || person.siblingOf === RESIDENT_ID) return 0;
  if (person.spouseOf) return generation(person.spouseOf);
  const depth = descendantDepth(person);
  return depth === -1 ? 0 : depth;
}

export const GENERATION_LABELS = [
  "You\nand Wei",
  "Your\nchildren",
  "Your\ngrandchildren",
  "Great-\ngrandchild",
];
