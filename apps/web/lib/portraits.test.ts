import assert from "node:assert/strict";
import test from "node:test";
import { family } from "./mocks/family.ts";
import { portraitFor } from "./portraits.ts";

/** Run with: node --test lib/portraits.test.ts */

test("every family member has a drawn portrait", () => {
  for (const p of family) assert.ok(portraitFor(p.id), `${p.id} has no portrait`);
});

test("an unknown voice is never given a face", () => {
  assert.equal(portraitFor("anna"), undefined);
});
