import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applicationSchema,
  adminUpdateSchema,
  statuses,
} from "../src/lib/validation";
import { content } from "../src/lib/content";
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
test("both language catalogues have matching structure and six subjects", () => {
  assert.deepEqual(Object.keys(content.en), Object.keys(content.sq));
  assert.equal(content.en.topics.length, 6);
  assert.equal(content.sq.topics.length, 6);
  assert.equal(content.sq.sessions.length, 6);
  assert.equal(content.en.faqs.length, 5);
});
