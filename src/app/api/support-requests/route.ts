import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supportSchema } from "@/lib/support";
import { database, sameOrigin } from "@/lib/server";
import { notifySupportRequest } from "@/lib/support-email";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "origin" }, { status: 403 });
  let stage = "validation";
  try {
    const raw = await req.text();
    if (raw.length > 16000)
      return NextResponse.json({ error: "validation" }, { status: 413 });
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "validation" }, { status: 400 });
    }
    const parsed = supportSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "validation" }, { status: 400 });
    stage = "database_configuration";
    const missing = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ].filter((name) => !process.env[name]?.trim());
    if (missing.length) {
      console.error("BMM_HELP_CONFIG_MISSING", { variables: missing });
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
      if (!["https:", "http:"].includes(url.protocol)) throw Error();
    } catch {
      console.error("BMM_HELP_CONFIG_INVALID", {
        variable: "NEXT_PUBLIC_SUPABASE_URL",
      });
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
    const db = database();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = createHash("sha256")
      .update(`support:${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
      .digest("hex");
    stage = "rate_limit";
    const { data: allowed, error: limitError } = await db.rpc(
      "consume_rate_limit",
      { bucket_key: key, max_requests: 5, window_seconds: 3600 },
    );
    if (limitError) throw limitError;
    if (!allowed) return NextResponse.json({ error: "rate" }, { status: 429 });
    const { name, email, phone, message, language } = parsed.data;
    stage = "save_request";
    const { data, error } = await db
      .from("support_requests")
      .insert({
        name,
        email,
        phone,
        message,
        dedupe_key: createHash("sha256")
          .update(JSON.stringify([email, phone, message]))
          .digest("hex"),
        language,
        privacy_version: "2026-10-support",
        privacy_acknowledged_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505")
        return NextResponse.json({ error: "duplicate" }, { status: 409 });
      throw error;
    }
    try {
      await notifySupportRequest(data.id);
    } catch {
      console.error("Help request saved; admin notification pending", data.id);
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    // Never log exception messages/details: they may contain submitted data or secrets.
    const rawCode =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    const code =
      typeof rawCode === "string" &&
      /^(?:[0-9A-Z]{5}|PGRST[0-9]{3})$/.test(rawCode)
        ? rawCode
        : "unclassified";
    console.error("BMM_HELP_SAVE_FAILED", { stage, code });
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
