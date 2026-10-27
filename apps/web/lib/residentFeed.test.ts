import assert from "node:assert/strict";
import test from "node:test";
import { approvals } from "./mocks/approvals.ts";
import { TOPICS } from "./mocks/content.ts";
import { activeSpeaker, needsConfirm, residentFeed, visibleTopics } from "./residentFeed.ts";

test("a captured memory reaches her news and the person's page without approval", () => {
  const f = residentFeed({});
  assert.ok(f.news.some((n) => n.id === "a4"));
  assert.ok(f.memories.some((m) => m.id === "a4" && m.personId === "david"));
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
    assert.ok(!text.includes("david's aunt"));
    assert.ok(!text.includes("jason's daughter"));
  }
});

test("only people and tree edits wait for a confirm", () => {
  assert.deepEqual(needsConfirm({}).map((a) => a.id).sort(), ["a2", "a3"]);
  assert.deepEqual(needsConfirm({ a2: "confirmed" }).map((a) => a.id), ["a3"]);
});

test("family news is always on her rail; other topics follow the family's switches", () => {
  const ids = (n: Parameters<typeof visibleTopics>[0]) => visibleTopics(n).map((t) => t.id);
  assert.deepEqual(ids({ on: true, off: [] }), TOPICS.map((t) => t.id));
  assert.ok(!ids({ on: true, off: ["garden"] }).includes("garden"));
  assert.deepEqual(ids({ on: false, off: [] }), ["family"]);
});

test("every story has a topic, and call memories file under family", () => {
  const f = residentFeed({});
  assert.equal(f.news.find((n) => n.id === "a4")!.topic, "family");
  for (const n of f.news) assert.ok(TOPICS.some((t) => t.id === n.topic), n.id);
});

test("the talking tile follows the family's speaker corrections, so a voice they marked unknown is never named", () => {
  const b = [{ id: "u1", speakerId: "lisa", transcribing: true }];
  assert.equal(activeSpeaker(b, {}), "lisa");
  assert.equal(activeSpeaker(b, { u1: null }), "unknown");
  assert.equal(activeSpeaker([{ id: "u4", speakerId: null, transcribing: true }], { u4: "emily" }), "emily");
  assert.equal(activeSpeaker([{ id: "u1", speakerId: "lisa", transcribing: false }], {}), null);
});

test("every memory she sees has an icon", () => {
  for (const m of residentFeed({}).memories) assert.ok(m.activity, `${m.id} has no icon`);
});
