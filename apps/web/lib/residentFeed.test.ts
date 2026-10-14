import assert from "node:assert/strict";
import test from "node:test";
import { approvals } from "./mocks/approvals.ts";
import { needsConfirm, residentFeed } from "./residentFeed.ts";

test("a captured memory reaches her news and the person's page without approval", () => {
  const f = residentFeed({});
  assert.ok(f.news.some((n) => n.id === "a4"));
  assert.ok(f.memories.some((m) => m.id === "a4" && m.personId === "emily"));
});

test("a removed memory stays out", () => {
  const f = residentFeed({ a4: "removed" });
  assert.ok(!f.news.some((n) => n.id === "a4"));
  assert.ok(!f.memories.some((m) => m.id === "a4"));
});

test("med notes, people and tree edits never reach her, whatever their state", () => {
  for (const state of [{}, ...["removed", "confirmed"].map((v) => Object.fromEntries(approvals.map((a) => [a.id, v])))]) {
    const f = residentFeed(state as never);
    const text = JSON.stringify(f).toLowerCase();
    assert.ok(!text.includes("blood pressure"));
    assert.ok(!text.includes("pill"));
    assert.ok(!text.includes("marcus"));
    assert.ok(!text.includes("jason's daughter"));
  }
});

test("only people and tree edits wait for a confirm", () => {
  assert.deepEqual(needsConfirm({}).map((a) => a.id).sort(), ["a2", "a3"]);
  assert.deepEqual(needsConfirm({ a2: "confirmed" }).map((a) => a.id), ["a3"]);
});
