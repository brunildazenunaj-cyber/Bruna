import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applicationSchema,
  adminUpdateSchema,
  statuses,
} from "../src/lib/validation";
import { content } from "../src/lib/content";
import { goldCopy } from "../src/lib/gold";
const valid = {
  name: "Test Person",
  email: "TEST@example.com",
  phone: "+355 69 123 4567",
  country: "Albania",
  experience: "beginner",
  reason: "I want to learn about markets.",
  duration: "unsure",
  privacy: true,
  marketing: false,
  language: "sq",
  website: "",
};
test("valid application normalizes email and preserves separate consent", () => {
  const a = applicationSchema.parse(valid);
  assert.equal(a.email, "test@example.com");
  assert.equal(a.marketing, false);
});
test("rejects spam, invalid international phone, missing privacy and oversized content", () => {
  for (const change of [
    { website: "spam" },
    { phone: "0690000000" },
    { privacy: false },
    { reason: "x".repeat(2001) },
    { experience: "fake" },
    { email: "bad" },
    { name: "" },
  ])
    assert.equal(
      applicationSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("admin updates restrict status, ID and notes", () => {
  for (const status of statuses)
    assert.equal(
      adminUpdateSchema.safeParse({
        id: "123e4567-e89b-42d3-a456-426614174000",
        status,
        notes: "",
      }).success,
      true,
    );
  assert.equal(
    adminUpdateSchema.safeParse({ id: "bad", status: "Approved", notes: "" })
      .success,
    false,
  );
});
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
  assert.equal(content.en.fields.length, 7);
  assert.equal(goldCopy.en.steps.length, 3);
  assert.equal(goldCopy.en.scannerSteps.length, 5);
});
