/** F12 privacy ledger + F13 family members / device pairing. SPEC §13. */

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  voiceStatus: "enrolled" | "not enrolled" | "needs re-enrolment";
  role: "family_admin" | "family";
}

export const members: FamilyMember[] = [
  { id: "ken", name: "Ken Chen", relationship: "grandson", voiceStatus: "enrolled", role: "family_admin" },
  { id: "lisa", name: "Lisa Chen", relationship: "daughter", voiceStatus: "enrolled", role: "family" },
  { id: "david", name: "David Chen", relationship: "son", voiceStatus: "enrolled", role: "family" },
  { id: "karen", name: "Karen Chen", relationship: "David's wife", voiceStatus: "not enrolled", role: "family" },
  { id: "emily", name: "Emily Chen", relationship: "granddaughter", voiceStatus: "needs re-enrolment", role: "family" },
];

export const roles = [
  {
    role: "Family admin",
    body: "Can approve or reject anything in the queue, edit the family tree, and manage who has access.",
  },
  {
    role: "Family",
    body: "Can call Grandma, see calls and memories, and propose corrections and tree edits — but not approve them alone.",
  },
];

export const devicePairing = {
  status: "Paired · online",
  detail: "Pine Ridge, room 12 · seen 4 minutes ago",
};

export const consents = [
  { name: "Ken Chen", detail: "Voice enrollment · call recording off" },
  { name: "Lisa Chen", detail: "Voice enrollment · call recording off" },
  { name: "David Chen", detail: "Voice enrollment · call recording off" },
  { name: "Emily Chen", detail: "Voice enrollment (needs re-enrolment) · call recording off" },
  { name: "Karen Chen", detail: "Not enrolled — no voiceprint held" },
];

export const dataHeld = [
  { label: "Voiceprints stored", value: "4" },
  { label: "Calls processed", value: "14" },
  { label: "Raw call audio kept", value: "0 — deleted after processing" },
  { label: "Memories saved", value: "11" },
  { label: "Med notes saved", value: "7" },
];
