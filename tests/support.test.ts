import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { supportSchema } from "../src/lib/support";
test("Help can be requested before broker registration and rejects invalid or forged fields", () => {
  const input = {
    name: "Test Person",
    email: "TEST@example.com",
    phone: "+355 69 123 4567",
    message: "I cannot finish registration.",
    privacy: true,
    language: "en",
    website: "",
  };
  assert.equal(supportSchema.parse(input).email, "test@example.com");
  for (const change of [
    { message: "" },
    { message: "x".repeat(2001) },
    { phone: "" },
    { privacy: false },
    { website: "spam" },
    { status: "Resolved" },
    { password: "secret" },
  ])
    assert.equal(
      supportSchema.safeParse({ ...input, ...change }).success,
      false,
    );
});
test("Help requests stay private, reject duplicates and audit admin resolution/deletion", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);",
    );
    for (const file of [
      "001_academy.sql",
      "002_gold_requests.sql",
      "003_gold_whatsapp.sql",
      "004_support_requests.sql",
    ])
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    const insert =
      "insert into support_requests(name,email,phone,message,language,privacy_version,privacy_acknowledged_at,dedupe_key) values('Test Person','test@example.com','+355691234567','Registration is not working','en','v1',now(),'hash') returning id,status";
    const row = (await db.query<{ id: string; status: string }>(insert))
      .rows[0];
    assert.equal(row.status, "New");
    await assert.rejects(db.exec(insert), /unique/);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(
        db.exec("select * from support_requests"),
        /permission denied/,
      );
      await assert.rejects(db.exec(insert), /permission denied/);
      await assert.rejects(
        db.query("select manage_support_request(null,$1,'delete')", [row.id]),
        /permission denied/,
      );
      await db.exec("reset role");
    }
    const actor = "123e4567-e89b-42d3-a456-426614174000";
    const action = (a: string) =>
      db.query("select manage_support_request($1,$2,$3)", [actor, row.id, a]);
    await assert.rejects(action("resolve"), /Unauthorized/);
    await db.query("insert into auth.users values($1)", [actor]);
    await db.query("insert into admins values($1)", [actor]);
    await action("resolve");
    assert.equal(
      (
        await db.query<{ status: string }>(
          "select status from support_requests",
        )
      ).rows[0].status,
      "Resolved",
    );
    await action("reopen");
    await assert.rejects(action("approve"), /Invalid action/);
    await action("delete");
    assert.equal(
      (await db.query("select * from support_requests")).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          "select * from audit_logs where action like 'support_request.%'",
        )
      ).rows.length,
      3,
    );
  } finally {
    await db.close();
  }
});
