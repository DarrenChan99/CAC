import assert from "node:assert/strict";
import test from "node:test";
import { generation, relationship, relationshipToResident } from "./relationships.ts";

/** Run with: node --test lib/relationships.test.ts */

test("descendants are named from the resident's point of view", () => {
  assert.equal(relationshipToResident("lisa"), "your daughter");
  assert.equal(relationshipToResident("david"), "your son");
  assert.equal(relationshipToResident("emily"), "your granddaughter");
  assert.equal(relationshipToResident("ken"), "your grandson");
  // Four generations deep, derived through Emily — not stored anywhere.
  assert.equal(relationshipToResident("ava"), "your great-granddaughter");
});

test("non-descendants are not given possessive labels they haven't earned", () => {
  assert.equal(relationshipToResident("ling"), "your sister");
  assert.equal(relationship("karen"), "David's wife");
  assert.equal(relationshipToResident("mei"), "this is you");
  assert.equal(relationshipToResident("wei"), "remembered");
});

test("generation puts everyone on the right rail", () => {
  assert.equal(generation("mei"), 0);
  assert.equal(generation("ling"), 0);
  assert.equal(generation("wei"), 0);
  assert.equal(generation("lisa"), 1);
  // A spouse sits on the generation of the person they married in to.
  assert.equal(generation("karen"), 1);
  assert.equal(generation("emily"), 2);
  assert.equal(generation("ava"), 3);
});

test("re-parenting changes the label, because it is derived", () => {
  // Approval item a3 moves Ava from Emily to Jason. Both routes are
  // great-grandchildren, which is the point: the tree can be corrected without
  // anyone hand-editing a relationship string.
  assert.equal(relationshipToResident("ava"), "your great-granddaughter");
  assert.equal(generation("jason"), 2);
});
