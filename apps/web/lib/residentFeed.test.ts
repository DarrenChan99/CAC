import assert from "node:assert/strict";
import test from "node:test";
import { approvals } from "./mocks/approvals.ts";
import { residentFeed } from "./residentFeed.ts";

test("nothing from a call reaches the resident until approved", () => {
  const f = residentFeed({});
  assert.ok(!f.memories.some((m) => m.id === "a4"));
  assert.ok(!f.news.some((n) => n.id === "a4"));
});

test("an approved memory appears on her news and on the person's page", () => {
  const f = residentFeed({ a4: "approved" });
  assert.ok(f.news.some((n) => n.id === "a4"));
  assert.ok(f.memories.some((m) => m.id === "a4" && m.personId === "emily"));
});

test("a rejected memory stays out", () => {
  assert.ok(!residentFeed({ a4: "rejected" }).news.some((n) => n.id === "a4"));
});

test("med notes never appear, even when approved", () => {
  const all = Object.fromEntries(approvals.map((a) => [a.id, "approved" as const]));
  const f = residentFeed(all);
  const text = JSON.stringify(f).toLowerCase();
  assert.ok(!text.includes("blood pressure"));
  assert.ok(!text.includes("pill"));
});
