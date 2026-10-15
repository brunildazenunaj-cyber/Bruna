import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("database migration enforces private records, duplicate protection and persistent rate limit", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);`,
    );
    await db.exec(
      await readFile("supabase/migrations/001_academy.sql", "utf8"),
    );
    for (let i = 0; i < 6; i++) {
      const r = await db.query<{ allowed: boolean }>(
        `select public.consume_rate_limit('test',5,3600) as allowed`,
      );
      assert.equal(r.rows[0].allowed, i < 5);
    }
    await db.exec(
      `update rate_limits set expires_at=now()-interval '1 second'`,
    );
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          `select consume_rate_limit('test',5,3600) as allowed`,
        )
      ).rows[0].allowed,
      true,
    );
    const insert = `insert into applications(name,email,phone,country,experience,reason,duration,language,privacy_version,privacy_acknowledged_at) values('Test Person','test@example.com','+355691234567','Albania','beginner','Learn about markets','unsure','sq','2026-10',now())`;
    await db.exec(insert);
    await assert.rejects(db.exec(insert), /unique/);
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select * from public.applications"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from public.membership_configuration"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select consume_rate_limit('test',5,3600)"),
      /permission denied/,
    );
    await db.exec("reset role;set role authenticated");
    await assert.rejects(
      db.query("select * from public.applications"),
      /permission denied/,
    );
    await db.exec("reset role");
    const { rows } = await db.query<{
      status: string;
      marketing_consent: boolean;
    }>("select status,marketing_consent from applications");
    assert.equal(rows[0].status, "New");
    assert.equal(rows[0].marketing_consent, false);
    const actor = "123e4567-e89b-42d3-a456-426614174000";
    await db.query("insert into auth.users(id) values ($1)", [actor]);
    const app = (await db.query<{ id: string }>("select id from applications"))
      .rows[0];
    await assert.rejects(
      db.query(
        "select update_academy_application($1,$2,'Contacted','Note',false)",
        [actor, app.id],
      ),
      /Unauthorized/,
    );
    await db.query("insert into admins(user_id) values ($1)", [actor]);
    await db.exec("set role service_role");
    await db.query(
      "select update_academy_application($1,$2,'Contacted','Internal note',true)",
      [actor, app.id],
    );
    const updated = (
      await db.query<{ status: string; marketing_withdrawn_at: string }>(
        "select status,marketing_withdrawn_at from applications",
      )
    ).rows[0];
    assert.equal(updated.status, "Contacted");
    assert.ok(updated.marketing_withdrawn_at);
    await assert.rejects(
      db.query(
        "select update_academy_application($1,$2,'Invalid','Bad',false)",
        [actor, app.id],
      ),
    );
    assert.equal((await db.query("select * from audit_logs")).rows.length, 1);
    await db.query("select delete_academy_application($1,$2)", [actor, app.id]);
    assert.equal((await db.query("select * from applications")).rows.length, 0);
    assert.equal((await db.query("select * from audit_logs")).rows.length, 2);
  } finally {
    await db.close();
  }
});
