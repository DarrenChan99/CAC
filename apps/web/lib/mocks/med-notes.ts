/** Family-only care notes — SPEC §8.4, §F10. These never reach the resident
 * device; that guarantee is enforced by never importing this file from
 * anything under `app/resident/`, not just by leaving it off the route list. */

export interface MedNote {
  id: string;
  title: string;
  quote: string;
  quoteBy: string;
  quoteMeta: string;
  status: "approved" | "pending";
  /** Second approver, once confirmed — a med note needs two. */
  approvedBy?: string;
}

export const medNotes: MedNote[] = [
  {
    id: "mn1",
    title: "Take blood pressure pill at 8 am",
    quote: "Make sure she takes the blood pressure pill at eight in the morning.",
    quoteBy: "David",
    quoteMeta: "son · Sunday 2:31",
    status: "approved",
    approvedBy: "Lisa",
  },
  {
    id: "mn2",
    title: "New reading glasses arriving Thursday",
    quote: "The optometrist said the new glasses should be ready by Thursday.",
    quoteBy: "Lisa",
    quoteMeta: "daughter · last Tuesday",
    status: "approved",
    approvedBy: "David",
  },
  {
    id: "mn3",
    title: "Ask the nurse about the knee stiffness",
    quote: "She mentioned her knee again — might be worth flagging to the nurse.",
    quoteBy: "Ken",
    quoteMeta: "grandson · last Sunday",
    status: "approved",
    approvedBy: "Lisa",
  },
];

export const pendingMedNote = {
  title: "Blood pressure pill at 8 am",
  quote: "Make sure she takes the blood pressure pill at eight in the morning.",
  quoteBy: "David",
  quoteMeta: "Sunday 14:07",
  note: "Not saved to the list until a second family member approves it.",
};

export const accessList = [
  { name: "Lisa Chen", relationship: "daughter", access: "can approve" },
  { name: "David Chen", relationship: "son", access: "can approve" },
  { name: "Ken Chen", relationship: "grandson", access: "can view" },
  { name: "Emily Chen", relationship: "granddaughter", access: "can view" },
];
