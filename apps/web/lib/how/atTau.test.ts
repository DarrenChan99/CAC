import assert from "node:assert/strict";
import test from "node:test";
import stats from "./stats.json" with { type: "json" };
import { countsAt, outcomeAt } from "./atTau.ts";

test("at the recorded cut-off nothing moves", () => {
  for (const [id, rows] of Object.entries(stats.windows as Record<string, number[][]>))
    for (const r of rows) assert.equal(outcomeAt(id === "stranger", r, stats.tau), r[1]);
});

test("a stricter cut-off never names more strangers or more family", () => {
  const lo = countsAt(0.3), mid = countsAt(stats.tau), hi = countsAt(0.8);
  assert.ok(lo.strangerNamed >= mid.strangerNamed && mid.strangerNamed >= hi.strangerNamed);
  assert.ok(lo.right >= mid.right && mid.right >= hi.right);
  assert.equal(countsAt(1.01).right, 0); // cosine never exceeds 1
});
