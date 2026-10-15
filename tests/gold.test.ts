import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { goldSchema, goldActionSchema } from "../src/lib/gold";
test("Gold form rejects forged approval, credentials and invalid data", () => {
  const a = {
    name: "Test Person",
    email: "TEST@example.com",
    broker_id: "TQ-123",
    language: "en",
    privacy: true,
    website: "",
  };
  assert.equal(goldSchema.parse(a).email, "test@example.com");
  for (const change of [
    { status: "Approved" },
    { password: "secret" },
    { privacy: false },
    { website: "spam" },
    { broker_id: "<script>" },
    { email: "invalid" },
  ])
    assert.equal(goldSchema.safeParse({ ...a, ...change }).success, false);
  assert.equal(
    goldActionSchema.safeParse({
      id: "123e4567-e89b-42d3-a456-426614174000",
      action: "approve",
    }).success,
    false,
  );
});
test("Gold migration isolates data and enforces manual approval, audit and sent timestamp", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);",
    );
    for (const file of ["001_academy.sql", "002_gold_requests.sql"])
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    const actor = "123e4567-e89b-42d3-a456-426614174000";
    await db.query("insert into auth.users values ($1)", [actor]);
    await db.exec(
      "insert into applications(name,email,phone,country,experience,reason,duration,language,privacy_version,privacy_acknowledged_at) values('Academy Person','same@example.com','+355691234567','Albania','beginner','Learning markets','6','en','v1',now())",
    );
    const insert =
      "insert into gold_requests(name,email,broker_id,language,privacy_version,privacy_acknowledged_at) values('Gold Person','same@example.com','TQ123','en','v1',now()) returning id,status";
    const a = (await db.query<{ id: string; status: string }>(insert)).rows[0];
    assert.equal(a.status, "Pending Verification");
    await assert.rejects(db.exec(insert), /unique/);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(
        db.query("select * from gold_requests"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select review_gold_request($1,$2,'approve',true)", [
          actor,
          a.id,
        ]),
        /permission denied/,
      );
      await db.exec("reset role");
    }
    const review = (action: string, verified = false) =>
      db.query("select review_gold_request($1,$2,$3,$4)", [
        actor,
        a.id,
        action,
        verified,
      ]);
    await assert.rejects(review("approve", true), /Unauthorized/);
    await db.query("insert into admins values ($1)", [actor]);
    await assert.rejects(review("invitation_sent"), /Invalid transition/);
    await assert.rejects(review("approve"), /manual verification/);
    await review("reject");
    await assert.rejects(review("approve", true), /Invalid transition/);
    await review("reopen");
    await review("approve", true);
    await review("invitation_sent");
    const sent = (
      await db.query<{
        invitation_sent_at: string;
        invitation_sent_by: string;
        status: string;
      }>("select * from gold_requests")
    ).rows[0];
    assert.equal(sent.status, "Invitation Sent");
    assert.ok(sent.invitation_sent_at);
    assert.equal(sent.invitation_sent_by, actor);
    await assert.rejects(review("invitation_sent"), /Invalid transition/);
    assert.equal((await db.query("select * from audit_logs")).rows.length, 4);
    assert.equal(
      (await db.query<{ status: string }>("select status from applications"))
        .rows[0].status,
      "New",
    );
  } finally {
    await db.close();
  }
});
