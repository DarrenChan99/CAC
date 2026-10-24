import assert from "node:assert/strict";
import test from "node:test";
import { CALL_END, CALL_START, timeline } from "./mocks/call-timeline.ts";

/** Run with: node --test lib/call-timeline.test.ts */

const enrolled = ["lisa", "david", "emily", "ken", "test"];

test("every speaker is an enrolled id or null (never a guess)", () => {
  for (const u of timeline) assert.ok(u.speakerId === null || enrolled.includes(u.speakerId), u.id);
});

test("utterances are ascending and fit inside the call window", () => {
  for (let i = 1; i < timeline.length; i++) assert.ok(timeline[i].at >= timeline[i - 1].at);
  assert.ok(CALL_END > CALL_START);
  for (const u of timeline) assert.ok(u.at >= CALL_START && u.at + u.speakFor <= CALL_END);
});

test("overlay keeps the captured chips", () => {
  assert.equal(timeline.filter((u) => u.captured).length, 3);
  assert.equal(timeline.find((u) => u.id === "u3")?.uncertainWord, "eight");
});
