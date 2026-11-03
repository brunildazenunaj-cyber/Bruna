import { test } from "node:test";
import assert from "node:assert/strict";
import { content } from "../src/lib/content";
import { goldCopy } from "../src/lib/gold";
test("all public and Gold copy has matching translated structure", () => {
  function compare(a: unknown, b: unknown) {
    if (typeof a === "string") {
      assert.equal(typeof b, "string");
      assert.ok((b as string).trim());
      return;
    }
    assert.deepEqual(Object.keys(a as object), Object.keys(b as object));
    for (const key of Object.keys(a as object))
      compare(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      );
  }
  compare(content.en, content.sq);
  compare(goldCopy.en, goldCopy.sq);
  assert.equal(goldCopy.en.steps.length, 3);
  assert.equal(goldCopy.en.scannerSteps.length, 5);
});
