import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supportSchema } from "@/lib/support";
import { database, sameOrigin } from "@/lib/server";
import { notifySupportRequest } from "@/lib/support-email";
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "origin" }, { status: 403 });
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
    const db = database();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = createHash("sha256")
      .update(`support:${ip}:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
      .digest("hex");
    const { data: allowed, error: limitError } = await db.rpc(
      "consume_rate_limit",
      { bucket_key: key, max_requests: 5, window_seconds: 3600 },
    );
    if (limitError) throw limitError;
    if (!allowed) return NextResponse.json({ error: "rate" }, { status: 429 });
    const { name, email, phone, message, language } = parsed.data;
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
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
