/**
 * What calls capture. Memories reach the resident's iPad on their own and the
 * family can remove them; med notes never do; people and tree edits wait for a
 * confirm. Ids are shared with the call's captured items.
 */

export type ApprovalKind = "memory" | "med" | "person" | "tree";

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
  /** For memories: who it is about, so it can land on their page. */
  personId?: string;
  /** Extra detail line, where the mock has one. */
  detail?: string;
}

export const approvals: ApprovalItem[] = [
  {
    id: "a4",
    kind: "memory",
    kindLabel: "Memory",
    personId: "emily",
    source: "Sunday call · 2:14",
    title: "Emily passed her driving test",
    quote: "I passed my driving test on the first try, Grandma.",
    quoteBy: "Emily",
    quoteMeta: "granddaughter · 2:14",
  },
  {
    id: "a1",
    kind: "med",
    kindLabel: "Med note",
    source: "Sunday call · 2:31",
    title: "Take blood pressure pill at 8 am",
    quote: "Make sure she takes the blood pressure pill at eight in the morning.",
    quoteBy: "David",
    quoteMeta: "son · 2:31",
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
    detail: "Jason → Ava, 2",
  },
];

export const FILTERS = [
  { id: "all", label: "All", kinds: null },
  { id: "memory", label: "Memories", kinds: ["memory"] },
  { id: "med", label: "Family notes", kinds: ["med"] },
  { id: "person", label: "People", kinds: ["person"] },
  { id: "tree", label: "Tree", kinds: ["tree"] },
] as const;
