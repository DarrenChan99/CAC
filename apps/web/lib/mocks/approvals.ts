/**
 * The approval queue — SPEC §8. Nothing reaches the resident's iPad until a
 * family member approves it here.
 */

export type ApprovalKind = "med" | "person" | "tree";

export interface ApprovalItem {
  id: string;
  kind: ApprovalKind;
  /** The chip label, e.g. "Med note". */
  kindLabel: string;
  source: string;
  title: string;
  /** Verbatim from the transcript, with who said it and when. */
  quote: string;
  quoteBy: string;
  quoteMeta: string;
  /** What approving actually does — shown before the buttons, not after. */
  consequence: string;
  /** Extra detail line, where the mock has one. */
  detail?: string;
}

export const approvals: ApprovalItem[] = [
  {
    id: "a1",
    kind: "med",
    kindLabel: "Med note",
    source: "Sunday call · 2:31",
    title: "Take blood pressure pill at 8 am",
    quote: "Make sure she takes the blood pressure pill at eight in the morning.",
    quoteBy: "David",
    quoteMeta: "son · 2:31",
    consequence:
      "Family notes, not medical instructions. Approving files this with the care team — it never shows on Grandma's iPad.",
  },
  {
    id: "a2",
    kind: "person",
    kindLabel: "New person",
    source: "Sunday call · 2:38",
    title: "Marcus — Emily's boyfriend?",
    quote: "Hi Mei, it's nice to finally meet you.",
    quoteBy: "Unknown speaker",
    quoteMeta: "· 2:38",
    consequence:
      "Said by Emily, granddaughter. Until someone confirms, Grandma's screen shows “Someone new” with no name.",
    detail: "Add as: Emily's partner · voice enrollment optional",
  },
  {
    id: "a3",
    kind: "tree",
    kindLabel: "Tree edit",
    source: "Sunday call · 3:02",
    title: "Ava is Jason's daughter",
    quote: "Jason brought Ava round on Saturday — she's getting so big.",
    quoteBy: "Emily",
    quoteMeta: "granddaughter · 3:02",
    consequence:
      "Adds a fourth generation. Grandma's family screen will show Ava under “your great-grandchildren”.",
    detail: "Jason → Ava, 2",
  },
];

export const FILTERS = [
  { id: "all", label: "All", kinds: null },
  { id: "med", label: "Med notes", kinds: ["med"] },
  { id: "person", label: "People", kinds: ["person"] },
  { id: "tree", label: "Tree edits", kinds: ["tree"] },
] as const;
