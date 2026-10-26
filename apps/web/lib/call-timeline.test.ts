import assert from "node:assert/strict";
import test from "node:test";
import { CALL_END, CALL_START, cameraId, participantIds, timeline } from "./mocks/call-timeline.ts";
import { byId } from "./mocks/family.ts";

/** Run with: node --test lib/call-timeline.test.ts */

test("every speaker is a family persona or null (never a guess)", () => {
  for (const u of timeline) assert.ok(u.speakerId === null || byId(u.speakerId), u.id);
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

test("participants and the camera person are real personas", () => {
  for (const id of participantIds) assert.ok(byId(id), id);
  assert.ok(cameraId === null || participantIds.includes(cameraId));
});
